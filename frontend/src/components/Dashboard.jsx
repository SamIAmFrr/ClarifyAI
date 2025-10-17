import { useState, useEffect } from "react";
import axios from "axios";
import { LogOut, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_safe-eats-ai/artifacts/ld5nhj99_ChatGPT%20Image%20Oct%2012%2C%202025%2C%2011_29_54%20AM.png";

export default function Dashboard({ user, setUser }) {
  const [allergyProfile, setAllergyProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    allergies: "",
    dietary_restrictions: "",
    skin_sensitivities: "",
    severity_notes: ""
  });
  const [analysisType, setAnalysisType] = useState("food");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageHistory, setImageHistory] = useState([]);

  useEffect(() => {
    loadProfile();
    loadHistory();
    loadImageHistory();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile/allergy`);
      setAllergyProfile(response.data);
      setProfileForm({
        allergies: response.data.allergies.join(", "),
        dietary_restrictions: response.data.dietary_restrictions?.join(", ") || "",
        skin_sensitivities: response.data.skin_sensitivities?.join(", ") || "",
        severity_notes: response.data.severity_notes || ""
      });
    } catch (error) {
      setShowProfileForm(true);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadImageHistory = async () => {
    try {
      const response = await axios.get(`${API}/image-history`);
      setImageHistory(response.data);
    } catch (error) {
      console.error('Failed to load image history:', error);
    }
  };

  const handleSaveProfile = async () => {
    const profileData = {
      allergies: profileForm.allergies.split(",").map(a => a.trim()).filter(Boolean),
      dietary_restrictions: profileForm.dietary_restrictions.split(",").map(d => d.trim()).filter(Boolean),
      skin_sensitivities: profileForm.skin_sensitivities.split(",").map(s => s.trim()).filter(Boolean),
      severity_notes: profileForm.severity_notes
    };

    try {
      let response;
      if (allergyProfile) {
        response = await axios.put(`${API}/profile/allergy`, profileData);
      } else {
        response = await axios.post(`${API}/profile/allergy`, profileData);
      }
      setAllergyProfile(response.data);
      setShowProfileForm(false);
      toast.success("Profile saved successfully!");
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast.error("Please enter something to analyze");
      return;
    }

    if (!allergyProfile) {
      toast.error("Please set up your allergy profile first");
      setShowProfileForm(true);
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/analyze`, {
        query,
        analysis_type: analysisType
      });
      setResult(response.data);
      loadHistory();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalyze = async () => {
    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    if (!allergyProfile) {
      toast.error("Please set up your allergy profile first");
      setShowProfileForm(true);
      return;
    }

    setAnalyzingImage(true);
    setImageResult(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await axios.post(`${API}/analyze-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setImageResult(response.data);
      loadImageHistory();
      toast.success("Image analyzed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Image analysis failed");
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="dashboard" data-testid="dashboard">
      <header className="dashboard-header">
        <div className="logo">
          <img src={LOGO_URL} alt="ClarifyAI Logo" className="logo-image" />
          ClarifyAI
        </div>
        <div className="user-info">
          {user.picture && (
            <img src={user.picture} alt={user.name} className="user-avatar" />
          )}
          <span className="user-name">{user.name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="logout-button"
            className="rounded-full"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Allergy Profile Section */}
        <section className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Your Allergy Profile</h2>
            <Button
              onClick={() => setShowProfileForm(!showProfileForm)}
              data-testid="edit-profile-button"
              variant="outline"
              className="rounded-full"
            >
              {showProfileForm ? "Cancel" : allergyProfile ? "Edit Profile" : "Set Up Profile"}
            </Button>
          </div>

          {allergyProfile && !showProfileForm ? (
            <div data-testid="allergy-profile-display">
              <div style={{ marginBottom: '1rem' }}>
                <Label className="font-semibold text-green-700">Allergies:</Label>
                <div className="allergy-tags">
                  {allergyProfile.allergies.map((allergy, idx) => (
                    <span key={idx} className="allergy-tag" data-testid={`allergy-tag-${idx}`}>
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
              {allergyProfile.dietary_restrictions?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <Label className="font-semibold text-green-700">Dietary Restrictions:</Label>
                  <div className="allergy-tags">
                    {allergyProfile.dietary_restrictions.map((restriction, idx) => (
                      <span key={idx} className="allergy-tag">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {allergyProfile.skin_sensitivities?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <Label className="font-semibold text-green-700">Skin Sensitivities:</Label>
                  <div className="allergy-tags">
                    {allergyProfile.skin_sensitivities.map((sensitivity, idx) => (
                      <span key={idx} className="allergy-tag">
                        {sensitivity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            showProfileForm && (
              <div data-testid="profile-form">
                <div style={{ marginBottom: '1rem' }}>
                  <Label htmlFor="allergies">Allergies (comma-separated) *</Label>
                  <Input
                    id="allergies"
                    data-testid="allergies-input"
                    placeholder="e.g., Peanuts, Dairy, Shellfish"
                    value={profileForm.allergies}
                    onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <Label htmlFor="dietary">Dietary Restrictions (comma-separated)</Label>
                  <Input
                    id="dietary"
                    data-testid="dietary-input"
                    placeholder="e.g., Vegan, Gluten-free"
                    value={profileForm.dietary_restrictions}
                    onChange={(e) => setProfileForm({ ...profileForm, dietary_restrictions: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <Label htmlFor="skin">Skin Sensitivities (comma-separated)</Label>
                  <Input
                    id="skin"
                    data-testid="skin-input"
                    placeholder="e.g., Fragrances, Alcohol"
                    value={profileForm.skin_sensitivities}
                    onChange={(e) => setProfileForm({ ...profileForm, skin_sensitivities: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <Label htmlFor="notes">Severity Notes</Label>
                  <Textarea
                    id="notes"
                    data-testid="notes-textarea"
                    placeholder="Any important details about your allergies..."
                    value={profileForm.severity_notes}
                    onChange={(e) => setProfileForm({ ...profileForm, severity_notes: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  data-testid="save-profile-button"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full"
                >
                  Save Profile
                </Button>
              </div>
            )
          )}
        </section>

        {/* Analysis Section */}
        <section className="section">
          <h2 className="section-title">Analyze Food, Products & Ingredients</h2>
          
          <div className="analysis-tabs">
            {[
              { value: 'food', label: 'Food' },
              { value: 'product', label: 'Product' },
              { value: 'skincare', label: 'Skincare' },
              { value: 'ingredient', label: 'Ingredient' }
            ].map(tab => (
              <button
                key={tab.value}
                data-testid={`tab-${tab.value}`}
                className={`tab-button ${analysisType === tab.value ? 'active' : ''}`}
                onClick={() => setAnalysisType(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="analysis-input-group">
            <Input
              data-testid="analysis-query-input"
              placeholder={`Enter ${analysisType} name or description...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              className="analysis-input"
            />
            <Button
              onClick={handleAnalyze}
              data-testid="analyze-button"
              disabled={analyzing}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-8"
            >
              {analyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          {result && (
            <div
              data-testid="analysis-result"
              className={`result-card ${result.is_safe ? 'safe' : result.warnings.length > 0 ? 'warning' : 'danger'}`}
            >
              <div className={`result-badge ${result.is_safe ? 'safe' : result.warnings.length > 0 ? 'warning' : 'danger'}`}>
                {result.is_safe ? (
                  <span data-testid="result-safe"><CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Safe</span>
                ) : (
                  <span data-testid="result-unsafe"><AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Caution</span>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#2e7d32' }}>
                {result.query}
              </h3>

              <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{result.result}</p>

              {result.warnings.length > 0 && (
                <div className="warning-list">
                  <Label className="font-semibold text-orange-700 mb-2 block">
                    <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Warnings:
                  </Label>
                  {result.warnings.map((warning, idx) => (
                    <div key={idx} className="warning-item" data-testid={`warning-${idx}`}>
                      • {warning}
                    </div>
                  ))}
                </div>
              )}

              {result.alternatives.length > 0 && (
                <div className="alternatives-list">
                  <Label className="font-semibold text-green-700 mb-2 block">
                    <Info size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Safe Alternatives:
                  </Label>
                  {result.alternatives.map((alt, idx) => (
                    <div key={idx} className="alternative-item" data-testid={`alternative-${idx}`}>
                      ✓ {alt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Image Upload Section */}
        <section className="section">
          <h2 className="section-title">📷 Scan Product Label</h2>
          <p style={{ marginBottom: '1.5rem', color: '#558b2f' }}>
            Upload a photo of a food product's ingredient list. AI will instantly identify allergens.
          </p>

          <div data-testid="image-upload-section">
            <div style={{ marginBottom: '1.5rem' }}>
              <Label htmlFor="label-image" className="mb-2 block font-semibold text-green-700">
                Upload Product Label Image
              </Label>
              <Input
                id="label-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                data-testid="image-upload-input"
                className="mb-2"
              />
              {imagePreview && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    data-testid="image-preview"
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', border: '2px solid #4caf50' }}
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleImageAnalyze}
              data-testid="analyze-image-button"
              disabled={analyzingImage || !imageFile}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-8"
            >
              {analyzingImage ? "Analyzing Image..." : "Analyze Label"}
            </Button>

            {imageResult && (
              <div
                data-testid="image-analysis-result"
                className={`result-card ${imageResult.is_safe ? 'safe' : 'danger'}`}
                style={{ marginTop: '1.5rem' }}
              >
                <div className={`result-badge ${imageResult.is_safe ? 'safe' : 'danger'}`}>
                  {imageResult.is_safe ? (
                    <span data-testid="image-result-safe">
                      <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Safe to Consume
                    </span>
                  ) : (
                    <span data-testid="image-result-unsafe">
                      <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Unsafe - Contains Allergens
                    </span>
                  )}
                </div>

                {imageResult.product_name && (
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#2e7d32' }}>
                    {imageResult.product_name}
                  </h3>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <Label className="font-semibold text-green-700 mb-2 block">Ingredients Found:</Label>
                  <div className="allergy-tags">
                    {imageResult.ingredients.slice(0, 10).map((ingredient, idx) => (
                      <span key={idx} className="allergy-tag" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                        {ingredient}
                      </span>
                    ))}
                    {imageResult.ingredients.length > 10 && (
                      <span className="allergy-tag" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                        +{imageResult.ingredients.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {imageResult.detected_allergens.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <Label className="font-semibold text-red-700 mb-2 block">
                      ⚠️ Detected Allergens:
                    </Label>
                    <div className="allergy-tags">
                      {imageResult.detected_allergens.map((allergen, idx) => (
                        <span
                          key={idx}
                          className="allergy-tag"
                          data-testid={`detected-allergen-${idx}`}
                          style={{ background: '#ffebee', color: '#c62828' }}
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {imageResult.warnings.length > 0 && (
                  <div className="warning-list">
                    <Label className="font-semibold text-orange-700 mb-2 block">
                      <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Warnings:
                    </Label>
                    {imageResult.warnings.map((warning, idx) => (
                      <div key={idx} className="warning-item" data-testid={`image-warning-${idx}`}>
                        • {warning}
                      </div>
                    ))}
                  </div>
                )}

                <p style={{ marginTop: '1rem', lineHeight: 1.6, color: '#555' }}>
                  {imageResult.detailed_analysis}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* History Section */}
        {history.length > 0 && (
          <section className="section">
            <h2 className="section-title">Recent Analysis History</h2>
            <div className="history-grid" data-testid="history-list">
              {history.slice(0, 5).map((item, idx) => (
                <div key={item.id} className="history-item" data-testid={`history-item-${idx}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Badge variant={item.is_safe ? "success" : "warning"}>
                        {item.analysis_type}
                      </Badge>
                      <h4 style={{ fontWeight: 600, margin: '0.5rem 0' }}>{item.query}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {item.is_safe ? (
                      <CheckCircle size={24} color="#4caf50" />
                    ) : (
                      <AlertCircle size={24} color="#ff9800" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Image Scan History */}
        {imageHistory.length > 0 && (
          <section className="section">
            <h2 className="section-title">Recent Label Scans</h2>
            <div className="history-grid" data-testid="image-history-list">
              {imageHistory.slice(0, 5).map((item, idx) => (
                <div key={item.id} className="history-item" data-testid={`image-history-item-${idx}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Badge variant={item.is_safe ? "success" : "warning"}>
                        Label Scan
                      </Badge>
                      <h4 style={{ fontWeight: 600, margin: '0.5rem 0' }}>
                        {item.product_name || 'Product Label'}
                      </h4>
                      {item.detected_allergens.length > 0 && (
                        <p style={{ fontSize: '0.85rem', color: '#d32f2f', marginTop: '0.25rem' }}>
                          Allergens: {item.detected_allergens.join(', ')}
                        </p>
                      )}
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {item.is_safe ? (
                      <CheckCircle size={24} color="#4caf50" />
                    ) : (
                      <AlertCircle size={24} color="#f44336" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}