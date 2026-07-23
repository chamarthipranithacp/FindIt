import requests

BASE_URL = 'http://127.0.0.1:8000'

def test_flow():
    # 1. Student A (Lost Item Owner) logs in and posts a lost item report
    resp_a = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "TEST101",
        "Password": "Password123!",
        "Role": "Student"
    })
    token_a = resp_a.json().get('token')
    headers_a = {"Authorization": f"Bearer {token_a}"}

    res_lost = requests.post(f"{BASE_URL}/api/items/lost/", data={
        "name": "Lost MacBook Air M2",
        "category": "Electronics",
        "description": "Silver laptop with tech stickers",
        "location": "Library 2nd Floor",
        "date": "2026-07-22",
        "phone": "+91 9999911111"
    }, headers=headers_a)
    print("1. Lost Item Posted by Student A:", res_lost.status_code)

    # 2. Founder posts a found item report
    res_found = requests.post(f"{BASE_URL}/api/items/found/", data={
        "finder_name": "Rohan Sharma (Founder)",
        "name": "Found MacBook Air M2",
        "category": "Electronics",
        "phone": "+91 9876500000"
    }, headers=headers_a)
    print("2. Found Item Posted by Founder Rohan:", res_found.status_code)
    print("   Founder Name saved:", res_found.json().get('reported_by_name'))
    print("   Founder Phone saved:", res_found.json().get('contact_phone'))

    # 3. Student A checks notifications
    res_notif = requests.get(f"{BASE_URL}/api/items/notifications/", headers=headers_a)
    print("3. Notifications Status:", res_notif.status_code)
    notifs = res_notif.json()
    if isinstance(notifs, list) and len(notifs) > 0:
        latest = notifs[0]
        print("   Latest Notification Title:", latest.get('title'))
        print("   Latest Notification Message:", latest.get('message'))

if __name__ == '__main__':
    test_flow()
