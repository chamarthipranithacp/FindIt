import os
import uuid
import datetime
from bson import ObjectId
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from findit_backend.db import db
from authentication.auth import MongoJWTAuthentication

# Helper to transform mongo doc to JSON-safe dictionary
def serialize_doc(doc):
    if not doc:
        return None
    doc['id'] = str(doc['_id'])
    del doc['_id']
    return doc

# Helper to save uploaded files (single or multiple)
def save_uploaded_files(files_list, subfolder="items", request=None):
    urls = []
    for file_obj in files_list:
        try:
            ext = file_obj.name.split('.')[-1] if '.' in file_obj.name else 'jpg'
            filename = f"{subfolder}/{uuid.uuid4()}.{ext}"
            path = default_storage.save(filename, ContentFile(file_obj.read()))
            if request:
                urls.append(request.build_absolute_uri(settings.MEDIA_URL + path))
            else:
                urls.append(settings.MEDIA_URL + path)
        except Exception:
            pass
    return urls

# Helper to create notification in MongoDB
def create_notification(user_email, title, message, notif_type="general"):
    try:
        notif = {
            "user_email": user_email,
            "title": title,
            "message": message,
            "type": notif_type,
            "read": False,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        db.Notifications.insert_one(notif)
    except Exception:
        pass


# --- NOTIFICATIONS ENDPOINTS ---

@api_view(['GET'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    try:
        user_email = getattr(request.user, 'email', '')
        if not user_email:
            return Response([], status=status.HTTP_200_OK)
        
        # Get notifications for this user (or broadcast to all admins if user is Admin)
        query = {'$or': [{'user_email': user_email}]}
        if request.user.role == 'Administrator':
            query['$or'].append({'user_email': 'admin@findit.edu'})
            
        notifications = list(db.Notifications.find(query).sort('_id', -1).limit(50))
        serialized = [serialize_doc(n) for n in notifications]
        return Response(serialized, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notif_id):
    try:
        query_id = ObjectId(notif_id) if ObjectId.is_valid(notif_id) else notif_id
        db.Notifications.update_one({'_id': query_id}, {'$set': {'read': True}})
        return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- LOST ITEMS ---

@api_view(['GET', 'POST'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def lost_items_list_create(request):
    if request.method == 'GET':
        items = list(db.LostItems.find().sort('_id', -1))
        serialized = [serialize_doc(item) for item in items]
        return Response(serialized, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data = request.data
        name = data.get('name') or data.get('item_name') or data.get('category')
        category = data.get('category')
        brand = data.get('brand', 'N/A')
        color = data.get('color', 'N/A')
        description = data.get('description')
        location = data.get('location')
        date = data.get('date')
        contact_phone = data.get('phone') or data.get('contact_phone', '')

        if not all([category, description, location, date]):
            return Response(
                {"error": "Please provide category, description, location, and date."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Handle multiple file uploads or single file upload
        uploaded_files = request.FILES.getlist('images') or (
            [request.FILES['image']] if 'image' in request.FILES else []
        )
        image_urls = save_uploaded_files(uploaded_files, subfolder="lost_items", request=request)

        new_item = {
            "name": name,
            "category": category,
            "brand": brand,
            "color": color,
            "description": description,
            "location": location,
            "date": date,
            "contact_phone": contact_phone,
            "status": "Lost",
            "images": image_urls,
            "image_url": image_urls[0] if image_urls else "",
            "reported_by_id": request.user.id,
            "reported_by_name": request.user.name,
            "reported_by_email": request.user.email,
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        result = db.LostItems.insert_one(new_item)
        new_item['_id'] = result.inserted_id

        # Notify reporter confirmation
        create_notification(
            user_email=request.user.email,
            title="Lost Item Report Registered",
            message=f"Your lost item report for '{name or category}' has been registered in the campus catalog.",
            notif_type="item_reported"
        )

        return Response(serialize_doc(new_item), status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_lost_item(request, item_id):
    try:
        query_id = ObjectId(item_id) if ObjectId.is_valid(item_id) else item_id
        item = db.LostItems.find_one({'_id': query_id})
        if not item:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

        is_owner = (item.get('reported_by_email') == request.user.email) or (str(item.get('reported_by_id')) == str(request.user.id))
        is_admin = (request.user.role == 'Administrator')

        if not (is_owner or is_admin):
            return Response({"error": "Permission denied. Only report owner or Administrator can remove this report."}, status=status.HTTP_403_FORBIDDEN)

        db.LostItems.delete_one({'_id': query_id})
        return Response({"message": "Lost item report removed successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- FOUND ITEMS ---

@api_view(['GET', 'POST'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def found_items_list_create(request):
    if request.method == 'GET':
        items = list(db.FoundItems.find().sort('_id', -1))
        serialized = [serialize_doc(item) for item in items]
        return Response(serialized, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data = request.data
        finder_name = data.get('finder_name') or request.user.name
        name = data.get('name') or data.get('category') or 'Found Item'
        category = data.get('category') or 'General'
        brand = data.get('brand', 'N/A')
        color = data.get('color', 'N/A')
        description = data.get('description', 'Found item reported by finder')
        location = data.get('location', 'Campus')
        date = data.get('date', datetime.datetime.utcnow().strftime('%Y-%m-%d'))
        phone = data.get('phone', '')

        # Handle multiple photo uploads
        uploaded_files = request.FILES.getlist('images') or (
            [request.FILES['image']] if 'image' in request.FILES else []
        )
        image_urls = save_uploaded_files(uploaded_files, subfolder="found_items", request=request)

        new_item = {
            "name": name,
            "category": category,
            "brand": brand,
            "color": color,
            "description": description,
            "location": location,
            "date": date,
            "contact_phone": phone,
            "status": "Available",
            "images": image_urls,
            "image_url": image_urls[0] if image_urls else "",
            "reported_by_id": request.user.id,
            "reported_by_name": finder_name,
            "reported_by_email": request.user.email,
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        result = db.FoundItems.insert_one(new_item)
        new_item['_id'] = result.inserted_id

        # Notify reporter confirmation
        create_notification(
            user_email=request.user.email,
            title="Found Item Cataloged",
            message=f"Thank you for reporting found '{name or category}'. It is now available in the ecosystem for claims.",
            notif_type="item_found"
        )

        # Automated Match Check: Notify users who reported lost items
        try:
            active_lost = list(db.LostItems.find({'status': 'Lost'}))
            for lost_doc in active_lost:
                lost_name = (lost_doc.get('name') or lost_doc.get('category') or '').lower()
                if lost_name and (lost_name in name.lower() or name.lower() in lost_name):
                    owner_email = lost_doc.get('reported_by_email')
                    owner_name = lost_doc.get('reported_by_name', 'Student')

                    phone_info = f" (Phone: {phone})" if phone else ""
                    
                    # 1. Notify Lost Item Owner
                    create_notification(
                        user_email=owner_email,
                        title="🚨 Match Found for Your Lost Item!",
                        message=f"Hi {owner_name}! A found item '{name}' matching your lost report was reported by Founder {finder_name}{phone_info}. Open catalog to contact founder directly!",
                        notif_type="item_matched"
                    )

                    # 2. Notify Founder about matching lost report
                    create_notification(
                        user_email=request.user.email,
                        title="Matching Lost Report Alert!",
                        message=f"Your found item report matches a lost item reported by {owner_name}. You can connect with them directly!",
                        notif_type="item_matched"
                    )
        except Exception as e:
            print("Match notification alert error:", e)

        return Response(serialize_doc(new_item), status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def verify_found_item(request, item_id):
    if request.user.role not in ['Security', 'Administrator']:
        return Response(
            {"error": "Only Security personnel or Administrators can verify found items."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        query_id = ObjectId(item_id) if ObjectId.is_valid(item_id) else item_id
        result = db.FoundItems.update_one(
            {'_id': query_id},
            {'$set': {'status': 'Available'}}
        )
        if result.matched_count == 0:
            return Response({"error": "Found item not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Found item verified successfully. It is now claimable."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_found_item(request, item_id):
    try:
        query_id = ObjectId(item_id) if ObjectId.is_valid(item_id) else item_id
        item = db.FoundItems.find_one({'_id': query_id})
        if not item:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

        is_owner = (item.get('reported_by_email') == request.user.email) or (str(item.get('reported_by_id')) == str(request.user.id))
        is_admin = (request.user.role == 'Administrator')

        if not (is_owner or is_admin):
            return Response({"error": "Permission denied. Only report founder or Administrator can remove this report."}, status=status.HTTP_403_FORBIDDEN)

        db.FoundItems.delete_one({'_id': query_id})
        return Response({"message": "Found item report removed successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- CLAIMS ---

@api_view(['POST'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def claim_item(request):
    data = request.data
    item_id = data.get('itemId')
    proof_text = data.get('proof', '') or data.get('ownershipDetails', '')
    ownership_details = data.get('ownershipDetails', proof_text)

    if not item_id:
        return Response(
            {"error": "Please specify the item ID to claim."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Handle proof images if uploaded as multipart files
    uploaded_proof_files = request.FILES.getlist('proof_images') or (
        [request.FILES['proof_image']] if 'proof_image' in request.FILES else []
    )
    proof_urls = save_uploaded_files(uploaded_proof_files, subfolder="claim_proofs", request=request)

    # Verify found item or lost item exists
    found_item = None
    try:
        query_id = ObjectId(item_id) if ObjectId.is_valid(item_id) else item_id
        found_item = db.FoundItems.find_one({'_id': query_id})
        if not found_item:
            found_item = db.LostItems.find_one({'_id': query_id})
    except Exception:
        pass

    if not found_item:
        return Response({"error": "Item not found in catalog."}, status=status.HTTP_404_NOT_FOUND)

    item_name = found_item.get('name') or found_item.get('category', 'Item')
    founder_name = found_item.get('reported_by_name', 'Founder')
    founder_phone = found_item.get('contact_phone', '')
    founder_email = found_item.get('reported_by_email', '')

    new_claim = {
        "item_id": item_id,
        "item_name": item_name,
        "item_description": found_item.get('description', 'Catalog Item'),
        "claimant_id": request.user.id,
        "claimant_name": request.user.name,
        "claimant_email": request.user.email,
        "founder_name": founder_name,
        "founder_phone": founder_phone,
        "founder_email": founder_email,
        "ownership_details": ownership_details,
        "proof": ownership_details,
        "proof_images": proof_urls,
        "status": "Approved",  # Instant peer-to-peer auto-approval without third party / admin bottleneck
        "created_at": datetime.datetime.utcnow().isoformat()
    }

    result = db.Claims.insert_one(new_claim)
    new_claim['_id'] = result.inserted_id

    # Auto-update found item status to Claimed
    try:
        db.FoundItems.update_one({'_id': query_id}, {'$set': {'status': 'Claimed'}})
        db.LostItems.update_one({'_id': query_id}, {'$set': {'status': 'Claimed'}})
    except Exception:
        pass

    phone_text = f" (Phone: {founder_phone})" if founder_phone else ""

    # Notify claimant with direct Founder details
    create_notification(
        user_email=request.user.email,
        title="Direct Contact Approved! 🎉",
        message=f"You have been connected directly to Founder {founder_name}{phone_text} for '{item_name}'. No admin approval required!",
        notif_type="claim_approved"
    )

    # Notify founder if email exists
    if founder_email and founder_email != request.user.email:
        create_notification(
            user_email=founder_email,
            title="Direct Contact Connected!",
            message=f"{request.user.name} has claimed found item '{item_name}'. Direct communication is active.",
            notif_type="claim_approved"
        )

    return Response(serialize_doc(new_claim), status=status.HTTP_201_CREATED)


@api_view(['GET'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def claims_list(request):
    if request.user.role != 'Administrator':
        # Standard students can view their own claims
        claims = list(db.Claims.find({'claimant_email': request.user.email}).sort('_id', -1))
    else:
        claims = list(db.Claims.find().sort('_id', -1))

    serialized = [serialize_doc(c) for c in claims]
    return Response(serialized, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def approve_claim(request, claim_id):
    if request.user.role != 'Administrator':
        return Response(
            {"error": "Only Administrators can approve claim requests."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        query_claim_id = ObjectId(claim_id) if ObjectId.is_valid(claim_id) else claim_id
        claim = db.Claims.find_one({'_id': query_claim_id})
        if not claim:
            return Response({"error": "Claim not found."}, status=status.HTTP_404_NOT_FOUND)

        db.Claims.update_one(
            {'_id': query_claim_id},
            {'$set': {'status': 'Approved'}}
        )

        item_id = claim.get('item_id')
        query_item_id = ObjectId(item_id) if ObjectId.is_valid(item_id) else item_id
        
        # Update found item status
        db.FoundItems.update_one({'_id': query_item_id}, {'$set': {'status': 'Approved'}})
        db.LostItems.update_one({'_id': query_item_id}, {'$set': {'status': 'Claimed'}})

        # Notify claimant
        create_notification(
            user_email=claim.get('claimant_email'),
            title="Claim Request Approved! 🎉",
            message=f"Your claim for '{claim.get('item_name', 'Item')}' has been approved by Admin! Show your QR Verification code to Security for pickup.",
            notif_type="claim_approved"
        )

        return Response({"message": "Claim approved successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def reject_claim(request, claim_id):
    if request.user.role != 'Administrator':
        return Response(
            {"error": "Only Administrators can reject claim requests."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        query_claim_id = ObjectId(claim_id) if ObjectId.is_valid(claim_id) else claim_id
        claim = db.Claims.find_one({'_id': query_claim_id})
        if not claim:
            return Response({"error": "Claim not found."}, status=status.HTTP_404_NOT_FOUND)

        db.Claims.update_one(
            {'_id': query_claim_id},
            {'$set': {'status': 'Rejected'}}
        )

        # Notify claimant
        create_notification(
            user_email=claim.get('claimant_email'),
            title="Claim Request Update",
            message=f"Your claim request for '{claim.get('item_name', 'Item')}' was not approved due to insufficient ownership verification.",
            notif_type="claim_rejected"
        )

        return Response({"message": "Claim rejected successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- SECURITY HANDOVER SCAN ---

@api_view(['POST'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def verify_qr(request):
    if request.user.role != 'Administrator':
        return Response(
            {"error": "Only Administrators can scan/verify claims."},
            status=status.HTTP_403_FORBIDDEN
        )

    claim_id = request.data.get('claimId')
    if not claim_id:
        return Response({"error": "Claim ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        query_claim_id = ObjectId(claim_id) if ObjectId.is_valid(claim_id) else claim_id
        claim = db.Claims.find_one({'_id': query_claim_id})
        
        if not claim:
            claim = db.Claims.find_one({
                '$or': [
                    {'item_id': claim_id},
                    {'claimant_name': {'$regex': claim_id, '$options': 'i'}}
                ]
            })

        if not claim:
            return Response({
                "success": False,
                "message": "Invalid claim ID or Ticket not found in database."
            }, status=status.HTTP_404_NOT_FOUND)

        if claim.get('status') != 'Approved':
            return Response({
                "success": False,
                "message": f"Claim exists but status is '{claim.get('status')}'. Verification requires 'Approved' status."
            }, status=status.HTTP_400_BAD_REQUEST)

        claimant_user = db.Users.find_one({'Email': claim.get('claimant_email')})
        role = claimant_user.get('Role', 'Student') if claimant_user else 'Student'

        verification_code = f"FINDIT-V-{str(claim['_id'])[-4:].upper()}"

        return Response({
            "success": True,
            "claimId": str(claim['_id']),
            "item": claim.get('item_name') or claim.get('item_description'),
            "claimant": claim.get('claimant_name'),
            "email": claim.get('claimant_email'),
            "role": role,
            "verificationCode": verification_code,
            "status": "Authorized for Release"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def confirm_handover(request):
    if request.user.role != 'Administrator':
        return Response(
            {"error": "Only Administrators can confirm handovers."},
            status=status.HTTP_403_FORBIDDEN
        )

    claim_id = request.data.get('claimId')
    delivery_note = request.data.get('deliveryMessage') or request.data.get('delivery_note') or "Delivered to owner properly by Admin."

    if not claim_id:
        return Response({"error": "Claim ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        query_claim_id = ObjectId(claim_id) if ObjectId.is_valid(claim_id) else claim_id
        claim = db.Claims.find_one({'_id': query_claim_id})
        if not claim:
            return Response({"error": "Claim not found."}, status=status.HTTP_404_NOT_FOUND)

        timestamp_str = datetime.datetime.utcnow().isoformat()

        # Update claim status & delivery message
        db.Claims.update_one({'_id': query_claim_id}, {'$set': {
            'status': 'Returned',
            'delivered_status': 'Delivered to Owner Properly',
            'delivery_message': delivery_note,
            'delivered_at': timestamp_str,
            'delivered_by_admin': request.user.name
        }})

        item_id = claim.get('item_id')
        if item_id:
            query_item_id = ObjectId(item_id) if ObjectId.is_valid(item_id) else item_id
            db.FoundItems.update_one({'_id': query_item_id}, {'$set': {
                'status': 'Returned',
                'delivered_status': 'Delivered to Owner Properly',
                'delivery_message': delivery_note,
                'delivered_at': timestamp_str
            }})
            db.LostItems.update_one({'_id': query_item_id}, {'$set': {
                'status': 'Returned',
                'delivered_status': 'Delivered to Owner Properly',
                'delivery_message': delivery_note,
                'delivered_at': timestamp_str
            }})

        # Increment trust score
        claimant_email = claim.get('claimant_email')
        if claimant_email:
            db.Users.update_one({'Email': claimant_email}, {'$inc': {'TrustScore': 5}})

            # Send Notification to Owner
            create_notification(
                user_email=claimant_email,
                title="Item Delivered to You Properly! 📦✅",
                message=f"Admin Handover Note for '{claim.get('item_name', 'Item')}': {delivery_note}",
                notif_type="delivery_confirmed"
            )

        founder_email = claim.get('founder_email')
        if founder_email:
            create_notification(
                user_email=founder_email,
                title="Found Item Successfully Delivered! 🎉",
                message=f"Admin Update: The item '{claim.get('item_name', 'Item')}' you found was delivered to the owner properly.",
                notif_type="delivery_confirmed"
            )

        return Response({
            "message": "Item marked as delivered to owner properly.",
            "delivery_message": delivery_note
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
