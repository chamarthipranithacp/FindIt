import requests

BASE_URL = 'http://127.0.0.1:8000'

def test_full_delivery():
    resp_admin = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "ADMIN99",
        "Password": "Password123!",
        "Role": "Administrator"
    })
    admin_token = resp_admin.json().get('token')
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    resp_student = requests.post(f"{BASE_URL}/api/auth/login", json={
        "UserId": "STU99",
        "Password": "Password123!",
        "Role": "Student"
    })
    student_token = resp_student.json().get('token')
    student_headers = {"Authorization": f"Bearer {student_token}"}

    found_resp = requests.post(f"{BASE_URL}/api/items/found/", data={
        "finder_name": "Rohan Sharma",
        "name": "Fastrack Watch",
        "category": "Watch",
        "phone": "+91 9876543210"
    }, headers=student_headers)
    found_data = found_resp.json()
    item_id = str(found_data.get('_id') or found_data.get('id'))

    claim_resp = requests.post(f"{BASE_URL}/api/items/claim/", json={
        "item_id": item_id,
        "itemId": item_id,
        "ownership_details": "Gold watch lost near auditorium"
    }, headers=student_headers)
    print("Claim Endpoint Response Status:", claim_resp.status_code)
    claim_data = claim_resp.json()
    claim_id = str(claim_data.get('_id') or claim_data.get('id'))

    delivery_note = "Item was delivered to owner Chamarthi Pranitha properly in person by campus admin."
    handover_resp = requests.post(f"{BASE_URL}/api/items/claims/handover/", json={
        "claimId": claim_id,
        "deliveryMessage": delivery_note
    }, headers=admin_headers)

    print("Delivery Confirmation HTTP Status:", handover_resp.status_code)
    print("Response Payload:", handover_resp.json())

if __name__ == '__main__':
    test_full_delivery()
