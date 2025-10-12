from fastapi import FastAPI, APIRouter, HTTPException, Response, Request, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Session(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_token: str
    user_id: str
    expires_at: str

class AllergyProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    allergies: List[str]
    dietary_restrictions: Optional[List[str]] = []
    skin_sensitivities: Optional[List[str]] = []
    severity_notes: Optional[str] = ""
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AllergyProfileCreate(BaseModel):
    allergies: List[str]
    dietary_restrictions: Optional[List[str]] = []
    skin_sensitivities: Optional[List[str]] = []
    severity_notes: Optional[str] = ""

class AnalysisRequest(BaseModel):
    query: str
    analysis_type: str  # 'food', 'product', 'skincare', 'ingredient'

class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    query: str
    analysis_type: str
    result: str
    is_safe: bool
    warnings: List[str]
    alternatives: List[str]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Authentication helper
async def get_current_user(request: Request) -> str:
    session_token = request.cookies.get('session_token')
    if not session_token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            session_token = auth_header.split(' ')[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = datetime.fromisoformat(session['expires_at'])
    if expires_at < datetime.now(timezone.utc):
        await db.sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    return session['user_id']

# Health check endpoint
@api_router.get("/")
async def root():
    return {"status": "ok", "message": "ClarifyAI API"}

# Auth endpoints
@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    async with httpx.AsyncClient() as client:
        try:
            api_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if api_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            session_data = api_response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")
    
    # Create or get user
    user_email = session_data['email']
    existing_user = await db.users.find_one({"email": user_email})
    
    if not existing_user:
        user = User(
            email=session_data['email'],
            name=session_data['name'],
            picture=session_data.get('picture')
        )
        await db.users.insert_one(user.model_dump())
        user_id = user.id
    else:
        user_id = existing_user['id']
    
    # Create session
    session_token = session_data['session_token']
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session = Session(
        session_token=session_token,
        user_id=user_id,
        expires_at=expires_at.isoformat()
    )
    await db.sessions.insert_one(session.model_dump())
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    # Get user data
    user_data = await db.users.find_one({"id": user_id}, {"_id": 0})
    return {"user": user_data, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, user_id: str = Depends(get_current_user), request: Request = None):
    session_token = request.cookies.get('session_token')
    if session_token:
        await db.sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# Allergy Profile endpoints
@api_router.post("/profile/allergy", response_model=AllergyProfile)
async def create_allergy_profile(profile: AllergyProfileCreate, user_id: str = Depends(get_current_user)):
    # Delete existing profile
    await db.allergy_profiles.delete_many({"user_id": user_id})
    
    allergy_profile = AllergyProfile(
        user_id=user_id,
        **profile.model_dump()
    )
    await db.allergy_profiles.insert_one(allergy_profile.model_dump())
    return allergy_profile

@api_router.get("/profile/allergy", response_model=AllergyProfile)
async def get_allergy_profile(user_id: str = Depends(get_current_user)):
    profile = await db.allergy_profiles.find_one({"user_id": user_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.put("/profile/allergy", response_model=AllergyProfile)
async def update_allergy_profile(profile: AllergyProfileCreate, user_id: str = Depends(get_current_user)):
    existing = await db.allergy_profiles.find_one({"user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    updated_profile = AllergyProfile(
        id=existing['id'],
        user_id=user_id,
        **profile.model_dump()
    )
    await db.allergy_profiles.update_one(
        {"user_id": user_id},
        {"$set": updated_profile.model_dump()}
    )
    return updated_profile

# AI Analysis endpoint
@api_router.post("/analyze", response_model=AnalysisResult)
async def analyze_item(request: AnalysisRequest, user_id: str = Depends(get_current_user)):
    # Get user's allergy profile
    profile = await db.allergy_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Please set up your allergy profile first")
    
    allergies = profile.get('allergies', [])
    dietary_restrictions = profile.get('dietary_restrictions', [])
    skin_sensitivities = profile.get('skin_sensitivities', [])
    
    # Create AI prompt
    system_message = f"""You are an expert allergy assistant. Analyze products, ingredients, and foods for allergy safety.
    
User's allergies: {', '.join(allergies) if allergies else 'None'}
Dietary restrictions: {', '.join(dietary_restrictions) if dietary_restrictions else 'None'}
Skin sensitivities: {', '.join(skin_sensitivities) if skin_sensitivities else 'None'}
    
Provide a thorough analysis including:
1. Safety assessment (safe/warning/danger)
2. Specific concerns related to user's allergies
3. Alternative suggestions if unsafe
4. Emergency advice if needed

Be clear, concise, and prioritize user safety."""
    
    user_message = f"""Analyze this {request.analysis_type}: {request.query}
    
Provide your response in this JSON format:
{{
  "is_safe": true/false,
  "summary": "Brief safety summary",
  "warnings": ["warning1", "warning2"],
  "alternatives": ["alternative1", "alternative2"],
  "detailed_analysis": "Detailed explanation"
}}"""
    
    try:
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=f"analysis_{user_id}_{uuid.uuid4()}",
            system_message=system_message
        ).with_model("gemini", "gemini-2.5-pro")
        
        message = UserMessage(text=user_message)
        ai_response = await chat.send_message(message)
        
        # Parse AI response
        import json
        # Try to extract JSON from response
        response_text = ai_response
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0].strip()
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0].strip()
        
        try:
            parsed = json.loads(response_text)
        except:
            # Fallback if JSON parsing fails
            parsed = {
                "is_safe": False,
                "summary": response_text[:200],
                "warnings": ["Please review the detailed analysis"],
                "alternatives": [],
                "detailed_analysis": response_text
            }
        
        result = AnalysisResult(
            user_id=user_id,
            query=request.query,
            analysis_type=request.analysis_type,
            result=parsed.get('detailed_analysis', response_text),
            is_safe=parsed.get('is_safe', False),
            warnings=parsed.get('warnings', []),
            alternatives=parsed.get('alternatives', [])
        )
        
        # Save to history
        await db.analysis_history.insert_one(result.model_dump())
        
        return result
    
    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# History endpoint
@api_router.get("/history", response_model=List[AnalysisResult])
async def get_history(user_id: str = Depends(get_current_user)):
    history = await db.analysis_history.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(20).to_list(20)
    return history

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()