import requests

BASE_URL = 'http://127.0.0.1:8000'

def test_found_with_finder_name():
    # Login TEST101
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "TEST101",
        "Password": "Password123!",
        "Role": "Student"
    })
    print("1. Login status:", resp.status_code)
    token = resp.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}

    # Post Found Item with finder_name
    res_found = requests.post(f"{BASE_URL}/api/items/found/", data={
        "finder_name": "Saiswapna Finder",
        "name": "Found Blue Water Bottle",
        "category": "Water Bottle",
        "description": "Found near Canteen Table 2",
        "location": "Canteen",
        "date": "2026-07-22",
        "phone": "+91 9123456789"
    }, headers=headers)
    print("2. Post Found Item status:", res_found.status_code)
    print("   Reported By Name:", res_found.json().get('reported_by_name'))
    print("   Contact Phone:", res_found.json().get('contact_phone'))

if __name__ == '__main__':
    test_found_with_finder_name()
