#!/usr/bin/env python3
"""
Comprehensive Recipe Finder API Test
Tests the Recipe Finder endpoint functionality and data structure
"""

import requests
import json
import sys
from datetime import datetime

class RecipeFinderTester:
    def __init__(self, base_url="https://food-detective-5.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def test_recipe_finder_endpoint_structure(self):
        """Test Recipe Finder endpoint structure and error responses"""
        print("\n🔍 Testing Recipe Finder Endpoint Structure...")
        
        # Test 1: Endpoint exists
        try:
            response = requests.post(f"{self.api_url}/recipe-finder", json={"food_item": "pasta"})
            exists = response.status_code != 404
            self.log_test("Recipe Finder Endpoint Exists", exists, 
                         "Endpoint not found" if not exists else f"Returns {response.status_code}")
        except Exception as e:
            self.log_test("Recipe Finder Endpoint Exists", False, str(e))

        # Test 2: Authentication required
        try:
            response = requests.post(f"{self.api_url}/recipe-finder", json={"food_item": "chocolate cake"})
            auth_required = response.status_code == 401
            self.log_test("Authentication Required", auth_required,
                         f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("Authentication Required", False, str(e))

        # Test 3: Request validation
        try:
            response = requests.post(f"{self.api_url}/recipe-finder", json={})
            validation_works = response.status_code in [401, 422]  # Auth or validation error
            self.log_test("Request Validation", validation_works,
                         f"Expected 401 or 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Request Validation", False, str(e))

        # Test 4: Method validation (only POST allowed)
        try:
            response = requests.get(f"{self.api_url}/recipe-finder")
            method_validation = response.status_code == 405
            self.log_test("Method Validation (POST only)", method_validation,
                         f"Expected 405, got {response.status_code}")
        except Exception as e:
            self.log_test("Method Validation (POST only)", False, str(e))

    def test_recipe_history_endpoint(self):
        """Test Recipe History endpoint"""
        print("\n📚 Testing Recipe History Endpoint...")
        
        # Test 1: Endpoint exists
        try:
            response = requests.get(f"{self.api_url}/recipe-history")
            exists = response.status_code != 404
            self.log_test("Recipe History Endpoint Exists", exists,
                         "Endpoint not found" if not exists else f"Returns {response.status_code}")
        except Exception as e:
            self.log_test("Recipe History Endpoint Exists", False, str(e))

        # Test 2: Authentication required
        try:
            response = requests.get(f"{self.api_url}/recipe-history")
            auth_required = response.status_code == 401
            self.log_test("Recipe History Auth Required", auth_required,
                         f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("Recipe History Auth Required", False, str(e))

    def test_data_structure_validation(self):
        """Test expected data structures based on Pydantic models"""
        print("\n📋 Testing Data Structure Requirements...")
        
        # Test different food items that would be sent
        test_cases = [
            {"food_item": "chocolate cake"},
            {"food_item": "pasta"},
            {"food_item": "cookies"},
            {"food_item": "pizza"},
            {"food_item": ""},  # Empty string test
        ]
        
        for case in test_cases:
            try:
                response = requests.post(f"{self.api_url}/recipe-finder", json=case)
                # We expect 401 (auth) or 422 (validation) for empty string
                expected_codes = [401, 422] if case["food_item"] == "" else [401]
                valid_response = response.status_code in expected_codes
                
                test_name = f"Food Item: '{case['food_item']}'" if case["food_item"] else "Empty Food Item"
                self.log_test(test_name, valid_response,
                             f"Expected {expected_codes}, got {response.status_code}")
            except Exception as e:
                self.log_test(f"Food Item: '{case['food_item']}'", False, str(e))

    def test_error_handling(self):
        """Test error handling scenarios"""
        print("\n⚠️  Testing Error Handling...")
        
        # Test malformed JSON
        try:
            response = requests.post(f"{self.api_url}/recipe-finder", 
                                   data="invalid json",
                                   headers={"Content-Type": "application/json"})
            handles_bad_json = response.status_code in [400, 422]
            self.log_test("Malformed JSON Handling", handles_bad_json,
                         f"Expected 400 or 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Malformed JSON Handling", False, str(e))

        # Test missing Content-Type
        try:
            response = requests.post(f"{self.api_url}/recipe-finder", 
                                   data='{"food_item": "test"}')
            handles_missing_content_type = response.status_code in [400, 422, 415]
            self.log_test("Missing Content-Type Handling", handles_missing_content_type,
                         f"Expected 400, 422, or 415, got {response.status_code}")
        except Exception as e:
            self.log_test("Missing Content-Type Handling", False, str(e))

    def verify_backend_integration(self):
        """Verify backend integration and dependencies"""
        print("\n🔧 Verifying Backend Integration...")
        
        # Check if backend is running
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            backend_running = response.status_code == 200
            self.log_test("Backend Service Running", backend_running,
                         f"Backend health check failed: {response.status_code}")
        except Exception as e:
            self.log_test("Backend Service Running", False, str(e))

        # Check API documentation is accessible
        try:
            response = requests.get(f"{self.base_url}/docs", timeout=10)
            docs_accessible = response.status_code == 200
            self.log_test("API Documentation Accessible", docs_accessible,
                         "FastAPI docs not accessible")
        except Exception as e:
            self.log_test("API Documentation Accessible", False, str(e))

    def run_comprehensive_tests(self):
        """Run all Recipe Finder tests"""
        print("🍳 Recipe Finder Comprehensive API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Run all test suites
        self.verify_backend_integration()
        self.test_recipe_finder_endpoint_structure()
        self.test_recipe_history_endpoint()
        self.test_data_structure_validation()
        self.test_error_handling()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Recipe Finder Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All Recipe Finder tests passed!")
            return True
        else:
            print("⚠️  Some Recipe Finder tests failed.")
            return False

    def get_detailed_report(self):
        """Generate detailed test report"""
        return {
            "test_suite": "Recipe Finder API Tests",
            "timestamp": datetime.now().isoformat(),
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": f"{(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "0%",
            "test_results": self.test_results,
            "summary": {
                "endpoint_exists": any(t["test"] == "Recipe Finder Endpoint Exists" and t["success"] for t in self.test_results),
                "authentication_working": any(t["test"] == "Authentication Required" and t["success"] for t in self.test_results),
                "validation_working": any(t["test"] == "Request Validation" and t["success"] for t in self.test_results),
                "history_endpoint_exists": any(t["test"] == "Recipe History Endpoint Exists" and t["success"] for t in self.test_results)
            }
        }

def main():
    tester = RecipeFinderTester()
    success = tester.run_comprehensive_tests()
    
    # Save detailed report
    report = tester.get_detailed_report()
    with open('/app/recipe_finder_test_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📄 Detailed report saved to: /app/recipe_finder_test_report.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())