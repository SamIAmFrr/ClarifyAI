import requests
import sys
import json
from datetime import datetime

class AllergyAssistantAPITester:
    def __init__(self, base_url="https://food-detective-5.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_health_check(self):
        """Test if backend is accessible"""
        try:
            response = requests.get(f"{self.base_url}/docs", timeout=10)
            success = response.status_code == 200
            self.log_test("Backend Health Check", success, 
                         f"Status: {response.status_code}" if not success else "")
            return success
        except Exception as e:
            self.log_test("Backend Health Check", False, str(e))
            return False

    def test_auth_session_without_session_id(self):
        """Test session creation without session ID (should fail)"""
        try:
            response = requests.post(f"{self.api_url}/auth/session", json={})
            success = response.status_code == 400
            self.log_test("Auth Session Without Session ID", success,
                         f"Expected 400, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Auth Session Without Session ID", False, str(e))
            return False

    def test_auth_me_without_token(self):
        """Test /auth/me without authentication (should fail)"""
        try:
            response = requests.get(f"{self.api_url}/auth/me")
            success = response.status_code == 401
            self.log_test("Auth Me Without Token", success,
                         f"Expected 401, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Auth Me Without Token", False, str(e))
            return False

    def test_profile_without_auth(self):
        """Test allergy profile endpoints without authentication"""
        endpoints = [
            ("GET", "/profile/allergy", "Get Profile Without Auth"),
            ("POST", "/profile/allergy", "Create Profile Without Auth"),
            ("PUT", "/profile/allergy", "Update Profile Without Auth")
        ]
        
        all_passed = True
        for method, endpoint, test_name in endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{self.api_url}{endpoint}")
                elif method == "POST":
                    response = requests.post(f"{self.api_url}{endpoint}", json={
                        "allergies": ["test"]
                    })
                elif method == "PUT":
                    response = requests.put(f"{self.api_url}{endpoint}", json={
                        "allergies": ["test"]
                    })
                
                success = response.status_code == 401
                self.log_test(test_name, success,
                             f"Expected 401, got {response.status_code}")
                if not success:
                    all_passed = False
            except Exception as e:
                self.log_test(test_name, False, str(e))
                all_passed = False
        
        return all_passed

    def test_analyze_without_auth(self):
        """Test analysis endpoint without authentication"""
        try:
            response = requests.post(f"{self.api_url}/analyze", json={
                "query": "test food",
                "analysis_type": "food"
            })
            success = response.status_code == 401
            self.log_test("Analyze Without Auth", success,
                         f"Expected 401, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Analyze Without Auth", False, str(e))
            return False

    def test_history_without_auth(self):
        """Test history endpoint without authentication"""
        try:
            response = requests.get(f"{self.api_url}/history")
            success = response.status_code == 401
            self.log_test("History Without Auth", success,
                         f"Expected 401, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("History Without Auth", False, str(e))
            return False

    def test_logout_without_auth(self):
        """Test logout endpoint without authentication"""
        try:
            response = requests.post(f"{self.api_url}/auth/logout")
            success = response.status_code == 401
            self.log_test("Logout Without Auth", success,
                         f"Expected 401, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Logout Without Auth", False, str(e))
            return False

    def test_cors_headers(self):
        """Test CORS configuration"""
        try:
            response = requests.options(f"{self.api_url}/auth/me")
            has_cors = 'access-control-allow-origin' in response.headers
            self.log_test("CORS Headers", has_cors,
                         "Missing CORS headers" if not has_cors else "")
            return has_cors
        except Exception as e:
            self.log_test("CORS Headers", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Allergy Assistant API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Test basic connectivity and health
        if not self.test_health_check():
            print("❌ Backend is not accessible. Stopping tests.")
            return False

        # Test authentication endpoints
        self.test_auth_session_without_session_id()
        self.test_auth_me_without_token()
        self.test_logout_without_auth()

        # Test protected endpoints without authentication
        self.test_profile_without_auth()
        self.test_analyze_without_auth()
        self.test_history_without_auth()

        # Test CORS
        self.test_cors_headers()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

    def get_test_summary(self):
        """Get detailed test summary"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": f"{(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "0%",
            "test_results": self.test_results
        }

def main():
    tester = AllergyAssistantAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    summary = tester.get_test_summary()
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())