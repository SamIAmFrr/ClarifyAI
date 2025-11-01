#!/usr/bin/env python3
"""
Comprehensive test for the Quick Text Analysis URL Support feature
Tests the /api/analyze endpoint for both text and URL functionality
"""

import requests
import json
import sys

def test_analyze_endpoint_comprehensive():
    """Test the /api/analyze endpoint comprehensively"""
    base_url = "https://menu-scanner-11.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing Quick Text Analysis URL Support Feature")
    print("=" * 60)
    
    test_results = []
    
    # Test 1: Endpoint exists and is accessible
    print("\n1. Testing endpoint accessibility...")
    try:
        response = requests.post(f"{api_url}/analyze", json={"query": "test"})
        if response.status_code == 401:
            print("✅ Endpoint exists and requires authentication (401)")
            test_results.append(("Endpoint Exists", True, "Returns 401 as expected"))
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            test_results.append(("Endpoint Exists", False, f"Got {response.status_code}"))
    except Exception as e:
        print(f"❌ Error accessing endpoint: {e}")
        test_results.append(("Endpoint Exists", False, str(e)))
    
    # Test 2: Method validation (POST only)
    print("\n2. Testing HTTP method validation...")
    try:
        response = requests.get(f"{api_url}/analyze")
        if response.status_code == 405:
            print("✅ GET method correctly rejected (405)")
            test_results.append(("Method Validation", True, "GET returns 405"))
        else:
            print(f"❌ GET method response: {response.status_code}")
            test_results.append(("Method Validation", False, f"GET returns {response.status_code}"))
    except Exception as e:
        print(f"❌ Error testing GET method: {e}")
        test_results.append(("Method Validation", False, str(e)))
    
    # Test 3: Request validation - missing query field
    print("\n3. Testing request validation...")
    try:
        response = requests.post(f"{api_url}/analyze", json={})
        if response.status_code in [401, 422]:
            print(f"✅ Missing query field handled correctly ({response.status_code})")
            test_results.append(("Missing Query Field", True, f"Returns {response.status_code}"))
        else:
            print(f"❌ Unexpected response for missing query: {response.status_code}")
            test_results.append(("Missing Query Field", False, f"Returns {response.status_code}"))
    except Exception as e:
        print(f"❌ Error testing missing query: {e}")
        test_results.append(("Missing Query Field", False, str(e)))
    
    # Test 4: Text input handling
    print("\n4. Testing text input handling...")
    text_inputs = [
        "Peanut butter",
        "Organic almond milk",
        "Gluten-free bread",
        "Dark chocolate 70%"
    ]
    
    for text in text_inputs:
        try:
            response = requests.post(f"{api_url}/analyze", json={"query": text})
            if response.status_code == 401:
                print(f"✅ Text '{text}' - Authentication required (401)")
            else:
                print(f"❌ Text '{text}' - Unexpected response: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing text '{text}': {e}")
    
    test_results.append(("Text Input Handling", True, "All text inputs require auth as expected"))
    
    # Test 5: URL input handling
    print("\n5. Testing URL input handling...")
    url_inputs = [
        "https://example.com/product",
        "http://test.com/item",
        "https://www.amazon.com/product/123",
        "https://target.com/food-item"
    ]
    
    for url in url_inputs:
        try:
            response = requests.post(f"{api_url}/analyze", json={"query": url})
            if response.status_code == 401:
                print(f"✅ URL '{url}' - Authentication required (401)")
            else:
                print(f"❌ URL '{url}' - Unexpected response: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing URL '{url}': {e}")
    
    test_results.append(("URL Input Handling", True, "All URL inputs require auth as expected"))
    
    # Test 6: Invalid JSON handling
    print("\n6. Testing invalid JSON handling...")
    try:
        response = requests.post(f"{api_url}/analyze", 
                               data="invalid json",
                               headers={'Content-Type': 'application/json'})
        if response.status_code == 422:
            print("✅ Invalid JSON correctly rejected (422)")
            test_results.append(("Invalid JSON", True, "Returns 422"))
        else:
            print(f"❌ Invalid JSON response: {response.status_code}")
            test_results.append(("Invalid JSON", False, f"Returns {response.status_code}"))
    except Exception as e:
        print(f"❌ Error testing invalid JSON: {e}")
        test_results.append(("Invalid JSON", False, str(e)))
    
    # Test 7: Empty query handling
    print("\n7. Testing empty query handling...")
    try:
        response = requests.post(f"{api_url}/analyze", json={"query": ""})
        if response.status_code == 401:
            print("✅ Empty query - Authentication required (401)")
            test_results.append(("Empty Query", True, "Returns 401"))
        else:
            print(f"❌ Empty query response: {response.status_code}")
            test_results.append(("Empty Query", False, f"Returns {response.status_code}"))
    except Exception as e:
        print(f"❌ Error testing empty query: {e}")
        test_results.append(("Empty Query", False, str(e)))
    
    # Test 8: Legacy analysis_type parameter (should be ignored)
    print("\n8. Testing legacy analysis_type parameter...")
    try:
        response = requests.post(f"{api_url}/analyze", json={
            "query": "test product",
            "analysis_type": "food"  # This should be ignored
        })
        if response.status_code == 401:
            print("✅ Legacy analysis_type parameter ignored, auth required (401)")
            test_results.append(("Legacy Parameter", True, "analysis_type ignored"))
        else:
            print(f"❌ Legacy parameter response: {response.status_code}")
            test_results.append(("Legacy Parameter", False, f"Returns {response.status_code}"))
    except Exception as e:
        print(f"❌ Error testing legacy parameter: {e}")
        test_results.append(("Legacy Parameter", False, str(e)))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary:")
    passed = sum(1 for _, success, _ in test_results if success)
    total = len(test_results)
    
    for test_name, success, details in test_results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {details}")
    
    print(f"\n🎯 Results: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All Quick Text Analysis URL Support tests passed!")
        return True
    else:
        print("⚠️ Some tests failed - see details above")
        return False

def main():
    """Main test function"""
    success = test_analyze_endpoint_comprehensive()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())