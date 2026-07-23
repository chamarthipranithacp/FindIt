import requests

BASE_URL = 'http://127.0.0.1:8000'

def test_found_submit():
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "TEST101",
        "Password": "Password123!",
        "Role": "Student/Faculty"
    })
    token = resp.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}

    res_found = requests.post(f"{BASE_URL}/api/items/found/", data={
        "finder_name": "Priya",
        "name": "Watch",
        "phone": "9876543210"
    }, headers=headers)

    print("Found Item Submission Status:", res_found.status_code)
    data = res_found.json()
    print("Saved Found Item Response:")
    print("  ID:", data.get('_id') or data.get('id'))
    print("  Finder Name:", data.get('reported_by_name'))
    print("  Item Name:", data.get('name'))
    print("  Contact Phone:", data.get('contact_phone'))
    print("  Description Fallback:", data.get('description'))
    print("  Location Fallback:", data.get('location'))
    print("  Date Fallback:", data.get('date'))

if __name__ == '__main__':
    test_found_submit()
