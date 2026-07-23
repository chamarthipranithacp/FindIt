import requests

BASE_URL = 'http://127.0.0.1:8000'

def run_test():
    # 0. Register user TEST101
    reg_resp = requests.post(f"{BASE_URL}/api/auth/register", json={
        "Name": "Test Student",
        "UserId": "TEST101",
        "Email": "teststudent@findit.edu",
        "Password": "Password123!",
        "Role": "Student"
    })
    print("0. Register status:", reg_resp.status_code)

    # 1. Login user TEST101
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "TEST101",
        "Password": "Password123!",
        "Role": "Student"
    })
    print("1. Login status:", resp.status_code)
    data = resp.json()
    token = data.get('token')
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Notifications
    res_notif = requests.get(f"{BASE_URL}/api/items/notifications/", headers=headers)
    print("2. Notifications GET status:", res_notif.status_code, "Count:", len(res_notif.json()) if res_notif.status_code == 200 else res_notif.text)

    # 3. Post Lost Item
    res_lost = requests.post(f"{BASE_URL}/api/items/lost/", data={
        "name": "Blue HydroFlask Bottle",
        "category": "Water Bottle",
        "description": "Blue stainless steel bottle with NASA sticker",
        "location": "Library 2nd Floor",
        "date": "2026-07-22"
    }, headers=headers)
    print("3. Post Lost Item status:", res_lost.status_code, res_lost.json() if res_lost.status_code == 201 else res_lost.text)

    # 4. Post Found Item
    res_found = requests.post(f"{BASE_URL}/api/items/found/", data={
        "name": "Found Blue Bottle",
        "category": "Water Bottle",
        "description": "Found blue flask with sticker near canteen",
        "location": "Canteen Table 3",
        "date": "2026-07-22"
    }, headers=headers)
    print("4. Post Found Item status:", res_found.status_code, res_found.json() if res_found.status_code == 201 else res_found.text)
    found_id = res_found.json().get('id') if res_found.status_code == 201 else None

    # 5. Submit Claim Request
    if found_id:
        res_claim = requests.post(f"{BASE_URL}/api/items/claim/", data={
            "itemId": found_id,
            "ownershipDetails": "It has my name tag and sticker on the bottom."
        }, headers=headers)
        print("5. Submit Claim status:", res_claim.status_code, res_claim.json() if res_claim.status_code == 201 else res_claim.text)

    # 6. Re-check Notifications after triggers
    res_notif2 = requests.get(f"{BASE_URL}/api/items/notifications/", headers=headers)
    print("6. Notifications list after triggers:", res_notif2.status_code, len(res_notif2.json()) if res_notif2.status_code == 200 else res_notif2.text)

if __name__ == '__main__':
    run_test()
