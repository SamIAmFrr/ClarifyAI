import requests
import sys
import json
from datetime import datetime

class AllergyAssistantAPITester:
    def __init__(self, base_url="https://menu-scanner-11.preview.emergentagent.com"):
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

    def test_recipe_finder_without_auth(self):
        """Test recipe finder endpoint without authentication"""
        try:
            response = requests.post(f"{self.api_url}/recipe-finder", json={
                "food_item": "chocolate cake"
            })
            success = response.status_code == 401
            self.log_test("Recipe Finder Without Auth", success,
                         f"Expected 401, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Recipe Finder Without Auth", False, str(e))
            return False

    def test_recipe_finder_empty_food_item(self):
        """Test recipe finder with empty food item (without auth)"""
        try:
            response = requests.post(f"{self.api_url}/recipe-finder", json={
                "food_item": ""
            })
            success = response.status_code == 401  # Should fail auth first
            self.log_test("Recipe Finder Empty Food Item", success,
                         f"Expected 401 (auth failure), got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Recipe Finder Empty Food Item", False, str(e))
            return False

    def test_recipe_finder_invalid_request(self):
        """Test recipe finder with invalid request body"""
        try:
            response = requests.post(f"{self.api_url}/recipe-finder", json={
                "invalid_field": "test"
            })
            success = response.status_code in [401, 422]  # Auth or validation error
            self.log_test("Recipe Finder Invalid Request", success,
                         f"Expected 401 or 422, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Recipe Finder Invalid Request", False, str(e))
            return False

    def test_recipe_history_without_auth(self):
        """Test recipe history endpoint without authentication"""
        try:
            response = requests.get(f"{self.api_url}/recipe-history")
            success = response.status_code == 401
            self.log_test("Recipe History Without Auth", success,
                         f"Expected 401, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Recipe History Without Auth", False, str(e))
            return False

    def test_recipe_finder_endpoint_exists(self):
        """Test that recipe finder endpoint exists (should return 401, not 404)"""
        try:
            response = requests.post(f"{self.api_url}/recipe-finder", json={
                "food_item": "pasta"
            })
            success = response.status_code != 404
            self.log_test("Recipe Finder Endpoint Exists", success,
                         f"Endpoint not found (404)" if not success else f"Endpoint exists (got {response.status_code})")
            return success
        except Exception as e:
            self.log_test("Recipe Finder Endpoint Exists", False, str(e))
            return False

    def test_recipe_history_endpoint_exists(self):
        """Test that recipe history endpoint exists (should return 401, not 404)"""
        try:
            response = requests.get(f"{self.api_url}/recipe-history")
            success = response.status_code != 404
            self.log_test("Recipe History Endpoint Exists", success,
                         f"Endpoint not found (404)" if not success else f"Endpoint exists (got {response.status_code})")
            return success
        except Exception as e:
            self.log_test("Recipe History Endpoint Exists", False, str(e))
            return False

    def test_recipe_finder_method_validation(self):
        """Test recipe finder only accepts POST method"""
        try:
            # Test GET method (should fail)
            response = requests.get(f"{self.api_url}/recipe-finder")
            success = response.status_code == 405  # Method not allowed
            self.log_test("Recipe Finder Method Validation", success,
                         f"Expected 405 for GET method, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Recipe Finder Method Validation", False, str(e))
            return False

    # Quick Text Analysis URL Support Tests
    def test_analyze_text_without_auth(self):
        """Test text analysis without authentication (should fail)"""
        try:
            response = requests.post(f"{self.api_url}/analyze", json={
                "query": "Peanut butter"
            })
            success = response.status_code == 401
            self.log_test("Analyze Text Without Auth", success,
                         f"Expected 401, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Analyze Text Without Auth", False, str(e))
            return False

    def test_analyze_url_without_auth(self):
        """Test URL analysis without authentication (should fail)"""
        try:
            response = requests.post(f"{self.api_url}/analyze", json={
                "query": "https://example.com/product"
            })
            success = response.status_code == 401
            self.log_test("Analyze URL Without Auth", success,
                         f"Expected 401, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Analyze URL Without Auth", False, str(e))
            return False

    def test_analyze_missing_query_field(self):
        """Test analyze endpoint with missing query field"""
        try:
            response = requests.post(f"{self.api_url}/analyze", json={})
            success = response.status_code in [401, 422]  # Auth or validation error
            self.log_test("Analyze Missing Query Field", success,
                         f"Expected 401 or 422, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Analyze Missing Query Field", False, str(e))
            return False

    def test_analyze_empty_query(self):
        """Test analyze endpoint with empty query string"""
        try:
            response = requests.post(f"{self.api_url}/analyze", json={
                "query": ""
            })
            success = response.status_code == 401  # Should fail auth first
            self.log_test("Analyze Empty Query", success,
                         f"Expected 401 (auth failure), got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Analyze Empty Query", False, str(e))
            return False

    def test_analyze_method_validation(self):
        """Test analyze endpoint only accepts POST method"""
        try:
            # Test GET method (should fail)
            response = requests.get(f"{self.api_url}/analyze")
            success = response.status_code == 405  # Method not allowed
            self.log_test("Analyze Method Validation", success,
                         f"Expected 405 for GET method, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Analyze Method Validation", False, str(e))
            return False

    def test_analyze_invalid_json(self):
        """Test analyze endpoint with malformed JSON"""
        try:
            response = requests.post(f"{self.api_url}/analyze", 
                                   data="invalid json",
                                   headers={'Content-Type': 'application/json'})
            success = response.status_code == 422  # Validation error
            self.log_test("Analyze Invalid JSON", success,
                         f"Expected 422, got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Analyze Invalid JSON", False, str(e))
            return False

    def test_analyze_endpoint_exists(self):
        """Test that analyze endpoint exists (should return 401, not 404)"""
        try:
            response = requests.post(f"{self.api_url}/analyze", json={
                "query": "test product"
            })
            success = response.status_code != 404
            self.log_test("Analyze Endpoint Exists", success,
                         f"Endpoint not found (404)" if not success else f"Endpoint exists (got {response.status_code})")
            return success
        except Exception as e:
            self.log_test("Analyze Endpoint Exists", False, str(e))
            return False

    def test_analyze_no_analysis_type_param(self):
        """Test that analyze endpoint no longer requires analysis_type parameter"""
        try:
            # Test with old analysis_type parameter (should still work but parameter ignored)
            response = requests.post(f"{self.api_url}/analyze", json={
                "query": "test product",
                "analysis_type": "food"  # This should be ignored
            })
            success = response.status_code == 401  # Should fail auth, not validation
            self.log_test("Analyze No Analysis Type Required", success,
                         f"Expected 401 (auth failure), got {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Analyze No Analysis Type Required", False, str(e))
            return False

    def test_analyze_url_detection(self):
        """Test URL detection logic (without auth, just structure validation)"""
        test_cases = [
            ("http://example.com", "HTTP URL"),
            ("https://example.com", "HTTPS URL"),
            ("ftp://example.com", "Non-HTTP URL (should be treated as text)"),
            ("example.com", "Domain without protocol (should be treated as text)"),
            ("product name", "Regular text")
        ]
        
        all_passed = True
        for query, description in test_cases:
            try:
                response = requests.post(f"{self.api_url}/analyze", json={
                    "query": query
                })
                # All should fail with 401 (auth required), not 422 (validation error)
                success = response.status_code == 401
                test_name = f"URL Detection - {description}"
                self.log_test(test_name, success,
                             f"Expected 401, got {response.status_code}")
                if not success:
                    all_passed = False
            except Exception as e:
                self.log_test(f"URL Detection - {description}", False, str(e))
                all_passed = False
        
        return all_passed

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

        # Test Recipe Finder endpoints
        print("\n🍳 Testing Recipe Finder Endpoints...")
        self.test_recipe_finder_endpoint_exists()
        self.test_recipe_history_endpoint_exists()
        self.test_recipe_finder_without_auth()
        self.test_recipe_finder_empty_food_item()
        self.test_recipe_finder_invalid_request()
        self.test_recipe_history_without_auth()
        self.test_recipe_finder_method_validation()

        # Test Quick Text Analysis URL Support
        print("\n🔍 Testing Quick Text Analysis URL Support...")
        self.test_analyze_endpoint_exists()
        self.test_analyze_text_without_auth()
        self.test_analyze_url_without_auth()
        self.test_analyze_missing_query_field()
        self.test_analyze_empty_query()
        self.test_analyze_method_validation()
        self.test_analyze_invalid_json()
        self.test_analyze_no_analysis_type_param()
        self.test_analyze_url_detection()

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