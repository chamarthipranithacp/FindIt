import requests

BASE_URL = 'http://127.0.0.1:8000'

def test_sec():
    # Register Security Staff SEC999
    reg_res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "Name": "Officer John",
        "UserId": "SEC999",
        "Email": "securityjohn@findit.edu",
        "Password": "Password123!",
        "Role": "Security"
    })
    print("Register Security status:", reg_res.status_code)

    # Login SEC999
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "SEC999",
        "Password": "Password123!",
        "Role": "Security"
    })
    print("Login Security status:", login_res.status_code)
    token = login_res.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch Claims List
    claims_res = requests.get(f"{BASE_URL}/api/items/claims/", headers=headers)
    print("Fetch claims list status:", claims_res.status_code, "Count:", len(claims_res.json()))

    if claims_res.status_code == 200 and len(claims_res.json()) > 0:
        claim_id = claims_res.json()[0]['id']
        app_res = requests.post(f"{BASE_URL}/api/items/claims/{claim_id}/approve/", headers=headers)
        print("Security Approve Claim status:", app_res.status_code, app_res.json())

if __name__ == '__main__':
    test_sec()
