import requests

BASE_URL = 'http://127.0.0.1:8000'

def test_delete():
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "STU99",
        "Password": "Password123!",
        "Role": "Student"
    })
    token = resp.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}

    res_post = requests.post(f"{BASE_URL}/api/items/lost/", data={
        "name": "Temporary Test Keys",
        "category": "Keys",
        "description": "Keychain with 2 keys",
        "location": "Library",
        "date": "2026-07-22"
    }, headers=headers)

    print("POST Status:", res_post.status_code)
    data = res_post.json()
    item_id = data.get('id') or data.get('_id')
    print(f"Created Lost Item ID: {item_id}")

    res_del = requests.delete(f"{BASE_URL}/api/items/lost/{item_id}/", headers=headers)
    print(f"Delete Status Code: {res_del.status_code}")
    print(f"Delete Response: {res_del.json()}")

if __name__ == '__main__':
    test_delete()
