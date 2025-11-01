#!/usr/bin/env python3
"""
Comprehensive test for clear history endpoints
"""
import requests
import json

def test_clear_history_endpoints():
    """Test all clear history endpoints comprehensively"""
    base_url = "https://menu-scanner-11.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🧪 Testing Clear History Endpoints Comprehensively")
    print("=" * 60)
    
    # Test endpoints
    endpoints = [
        ("/history", "Text Analysis History"),
        ("/image-history", "Image Analysis History"), 
        ("/menu-history", "Menu Analysis History")
    ]
    
    results = []
    
    for endpoint, name in endpoints:
        print(f"\n📋 Testing {name} ({endpoint})")
        print("-" * 40)
        
        # Test 1: DELETE without auth (should return 401)
        try:
            response = requests.delete(f"{api_url}{endpoint}")
            status = "✅ PASS" if response.status_code == 401 else "❌ FAIL"
            print(f"DELETE without auth: {status} (got {response.status_code}, expected 401)")
            
            if response.status_code == 401:
                try:
                    error_data = response.json()
                    has_detail = 'detail' in error_data
                    print(f"  - Error structure: {'✅ Valid' if has_detail else '❌ Missing detail field'}")
                    if has_detail:
                        print(f"  - Error message: {error_data['detail']}")
                except:
                    print("  - Error structure: ❌ Not valid JSON")
            
            results.append(f"{name} DELETE auth: {status}")
        except Exception as e:
            print(f"DELETE without auth: ❌ FAIL - {e}")
            results.append(f"{name} DELETE auth: ❌ FAIL")
        
        # Test 2: GET endpoint (should return 401, not 500)
        try:
            response = requests.get(f"{api_url}{endpoint}")
            status = "✅ PASS" if response.status_code == 401 else "❌ FAIL"
            print(f"GET endpoint: {status} (got {response.status_code}, expected 401)")
            results.append(f"{name} GET: {status}")
        except Exception as e:
            print(f"GET endpoint: ❌ FAIL - {e}")
            results.append(f"{name} GET: ❌ FAIL")
        
        # Test 3: POST method (should return 405 - Method Not Allowed)
        try:
            response = requests.post(f"{api_url}{endpoint}", json={})
            status = "✅ PASS" if response.status_code == 405 else "❌ FAIL"
            print(f"POST method: {status} (got {response.status_code}, expected 405)")
            results.append(f"{name} POST method: {status}")
        except Exception as e:
            print(f"POST method: ❌ FAIL - {e}")
            results.append(f"{name} POST method: ❌ FAIL")
        
        # Test 4: PUT method (should return 405 - Method Not Allowed)
        try:
            response = requests.put(f"{api_url}{endpoint}", json={})
            status = "✅ PASS" if response.status_code == 405 else "❌ FAIL"
            print(f"PUT method: {status} (got {response.status_code}, expected 405)")
            results.append(f"{name} PUT method: {status}")
        except Exception as e:
            print(f"PUT method: ❌ FAIL - {e}")
            results.append(f"{name} PUT method: ❌ FAIL")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 COMPREHENSIVE TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for result in results if "✅ PASS" in result)
    total = len(results)
    
    for result in results:
        print(result)
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All clear history endpoint tests PASSED!")
        return True
    else:
        print("⚠️  Some tests failed - check details above")
        return False

def test_endpoint_response_times():
    """Test response times for all endpoints"""
    base_url = "https://menu-scanner-11.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("\n⏱️  Testing Response Times")
    print("-" * 30)
    
    endpoints = ["/history", "/image-history", "/menu-history"]
    
    for endpoint in endpoints:
        try:
            import time
            start = time.time()
            response = requests.delete(f"{api_url}{endpoint}", timeout=5)
            end = time.time()
            
            response_time = (end - start) * 1000  # Convert to milliseconds
            status = "✅ Fast" if response_time < 1000 else "⚠️  Slow"
            print(f"{endpoint}: {status} ({response_time:.0f}ms)")
        except Exception as e:
            print(f"{endpoint}: ❌ Error - {e}")

if __name__ == "__main__":
    success = test_clear_history_endpoints()
    test_endpoint_response_times()
    
    if success:
        print("\n✅ All clear history endpoints are working correctly!")
    else:
        print("\n❌ Some issues found with clear history endpoints")