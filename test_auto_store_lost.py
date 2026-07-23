import requests

BASE_URL = 'http://127.0.0.1:8000'

def test_auto_store():
    # Login Student
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "STU99",
        "Password": "Password123!",
        "Role": "Student"
    })
    token = resp.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}

    # Submit Lost Report
    res_lost = requests.post(f"{BASE_URL}/api/items/lost/", data={
        "name": "Sony Noise Canceling Headphones",
        "category": "Accessories",
        "description": "Black over-ear headphones left in Auditorium Row C",
        "location": "Auditorium Row C",
        "date": "2026-07-22",
        "phone": "+91 9876543210"
    }, headers=headers)

    print("Post Lost Report Status:", res_lost.status_code)
    data = res_lost.json()
    print("Filed Lost Report Response:")
    print("  Report ID:", data.get('id') or data.get('_id'))
    print("  Reported By Name:", data.get('reported_by_name'))
    print("  Reported By Email:", data.get('reported_by_email'))

if __name__ == '__main__':
    test_auto_store()
