import random
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .auth import hash_password, verify_password, generate_jwt, MongoJWTAuthentication
from findit_backend.db import db
from bson import ObjectId

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    name = data.get('Name')
    user_id = data.get('UserId') or data.get('user_id')
    email = data.get('Email')
    password = data.get('Password')
    role = data.get('Role')

    if not all([name, user_id, email, password, role]):
        return Response(
            {"error": "Please provide Name, User ID, Email, Password, and Role (Student, Faculty, Security, Administrator)"},
            status=status.HTTP_400_BAD_REQUEST
        )

    clean_user_id = str(user_id).strip()
    normalized_email = email.strip().lower()

    # Validate role
    valid_roles = ["Student", "Faculty", "Security", "Administrator"]
    if role not in valid_roles:
        return Response(
            {"error": f"Invalid Role. Must be one of {valid_roles}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user already exists by UserId or Email
    existing_user = db.Users.find_one({
        "$or": [
            {"UserId": clean_user_id},
            {"UserId": {"$regex": f"^{clean_user_id}$", "$options": "i"}},
            {"Email": normalized_email}
        ]
    })
    if existing_user:
        return Response(
            {"error": "A user with this User ID or Email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Enforce email verification check from OTPVerifications collection
    otp_record = db.OTPVerifications.find_one({"Email": normalized_email})
    if not otp_record or not otp_record.get("isVerified", False):
        # Auto-verify/heal for constant OTP verification mode
        db.OTPVerifications.update_one(
            {"Email": normalized_email},
            {"$set": {"Code": "1234", "isVerified": True}},
            upsert=True
        )

    # Hash password and insert user
    hashed_pw = hash_password(password)
    user_doc = {
        "Name": name.strip(),
        "UserId": clean_user_id,
        "Email": normalized_email,
        "Password": hashed_pw,
        "Role": role,
        "TrustScore": 100,
        "isVerified": True
    }

    try:
        result = db.Users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        # Delete the OTP record as registration is now complete
        db.OTPVerifications.delete_one({"Email": normalized_email})
        
        token = generate_jwt(user_doc)
        return Response({
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": str(user_doc["_id"]),
                "user_id": user_doc["UserId"],
                "name": user_doc["Name"],
                "email": user_doc["Email"],
                "role": user_doc["Role"],
                "trust_score": user_doc["TrustScore"]
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {"error": f"Failed to register user: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    data = request.data
    user_id_input = data.get('UserId') or data.get('user_id') or data.get('userId') or data.get('Email') or data.get('email')
    password = data.get('Password') or data.get('password')

    if not all([user_id_input, password]):
        return Response(
            {"error": "Please provide both User ID and Password"},
            status=status.HTTP_400_BAD_REQUEST
        )

    clean_id = str(user_id_input).strip()

    # Match by UserId, case-insensitive UserId, or Email
    user_doc = db.Users.find_one({
        "$or": [
            {"UserId": clean_id},
            {"UserId": {"$regex": f"^{clean_id}$", "$options": "i"}},
            {"Email": clean_id.lower()}
        ]
    })

    if not user_doc or not verify_password(password, user_doc.get("Password", "")):
        return Response(
            {"error": "Invalid User ID or Password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Allow preset demo accounts to bypass email validation for convenience
    presets = ['student@gmail.com', 'faculty@gmail.com', 'security@gmail.com', 'admin@gmail.com', 'STU101', 'FAC101', 'SEC101', 'ADM101']
    if clean_id not in presets and clean_id.lower() not in presets and not user_doc.get("isVerified", False):
        return Response(
            {"error": "Please verify your email address first."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token = generate_jwt(user_doc)
    return Response({
        "message": "Logged in successfully",
        "token": token,
        "user": {
            "id": str(user_doc["_id"]),
            "user_id": user_doc.get("UserId", clean_id),
            "name": user_doc["Name"],
            "email": user_doc.get("Email", ""),
            "role": user_doc["Role"],
            "trust_score": user_doc.get("TrustScore", 100)
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    data = request.data
    email = data.get('Email')

    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    normalized_email = email.strip().lower()

    if not normalized_email.endswith('@gmail.com'):
        return Response({"error": "Please enter a valid @gmail.com address."}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user already exists
    existing_user = db.Users.find_one({"Email": normalized_email})
    if existing_user:
        return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    # Set constant OTP code 1234 as requested
    otp = "1234"

    # Save to OTPVerifications
    from datetime import datetime
    db.OTPVerifications.update_one(
        {"Email": normalized_email},
        {"$set": {"Code": otp, "isVerified": False, "CreatedAt": datetime.utcnow()}},
        upsert=True
    )

    # Send verification email
    subject = "Verify your Email - FindIt+"
    message = f"Your FindIt+ verification code is: {otp}\n\nThis code is valid for your signup verification. Please do not share it."
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@findit.com')
    
    try:
        send_mail(
            subject,
            message,
            from_email,
            [normalized_email],
            fail_silently=False
        )
    except Exception as mail_err:
        print(f"[SMTP Error] Failed sending OTP to {normalized_email}: {str(mail_err)}")

    print(f"\n==========================================")
    print(f"[OTP GENERATED] Email: {normalized_email} | Code: {otp}")
    print(f"==========================================\n")

    res_data = {
        "message": "Verification code sent successfully.",
        "email": normalized_email,
        "dev_otp": otp
    }

    return Response(res_data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    data = request.data
    email = data.get('Email', '')
    code = data.get('Code', '')

    if not email:
        return Response(
            {"error": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    normalized_email = email.strip().lower()

    # Always set email as verified in database for constant OTP 1234
    db.OTPVerifications.update_one(
        {"Email": normalized_email},
        {"$set": {"Code": "1234", "isVerified": True}},
        upsert=True
    )

    return Response({
        "message": "Email verified successfully!"
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([MongoJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    return Response({
        "user": {
            "id": user.id,
            "user_id": getattr(user, 'user_id', user.email),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "trust_score": user.trust_score
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    data = request.data
    email = data.get('Email', '')
    user_id = data.get('UserId', '')
    new_password = data.get('NewPassword', '')

    if not new_password:
        return Response({"error": "New password is required."}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({"error": "Password must be at least 6 characters long."}, status=status.HTTP_400_BAD_REQUEST)

    query = {}
    if email:
        query["Email"] = {"$regex": f"^{email.strip()}$", "$options": "i"}
    elif user_id:
        query["UserId"] = {"$regex": f"^{user_id.strip()}$", "$options": "i"}
    else:
        return Response({"error": "Email or User ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    user_doc = db.Users.find_one(query)
    if not user_doc:
        return Response({"error": "No registered user found with the provided email/User ID."}, status=status.HTTP_404_NOT_FOUND)

    hashed_pw = hash_password(new_password)
    db.Users.update_one(
        {"_id": user_doc["_id"]},
        {"$set": {"Password": hashed_pw}}
    )

    return Response({
        "message": "Password reset successfully! Please sign in with your new password."
    }, status=status.HTTP_200_OK)
