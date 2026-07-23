import requests

BASE_URL = 'http://127.0.0.1:8000'

def test_copy():
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "TEST101",
        "Password": "Password123!",
        "Role": "Student/Faculty"
    })
    token = resp.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}

    res_lost = requests.post(f"{BASE_URL}/api/items/lost/", data={
        "name": "Lost Wallet with ID",
        "category": "Wallet",
        "description": "Black leather wallet containing college ID and card",
        "location": "Cafeteria Block B",
        "date": "2026-07-22",
        "phone": "+91 9876543210"
    }, headers=headers)

    print("Lost Report Creation Status:", res_lost.status_code)
    data = res_lost.json()
    print("Report Copy Payload Received:")
    print("  ID:", data.get('_id') or data.get('id'))
    print("  Name:", data.get('name'))
    print("  Reporter Name:", data.get('reported_by_name'))
    print("  Contact Phone:", data.get('contact_phone'))

if __name__ == '__main__':
    test_copy()
