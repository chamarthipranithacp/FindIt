import os
import jwt
import bcrypt
import datetime
from bson import ObjectId
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from findit_backend.db import db

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_jwt_key_findit_12345")

class MongoUser:
    def __init__(self, user_doc):
        self.id = str(user_doc.get('_id'))
        self.user_id = user_doc.get('UserId', user_doc.get('Email', ''))
        self.name = user_doc.get('Name')
        self.email = user_doc.get('Email')
        self.role = user_doc.get('Role')
        self.trust_score = user_doc.get('TrustScore', 100)
        self.is_authenticated = True
        self.is_active = True

    @property
    def is_anonymous(self):
        return False

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def generate_jwt(user_doc) -> str:
    payload = {
        'userId': str(user_doc['_id']),
        'email': user_doc['Email'],
        'role': user_doc['Role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def decode_jwt(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("Token has expired")
    except jwt.InvalidTokenError:
        raise AuthenticationFailed("Invalid token")

class MongoJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        payload = decode_jwt(token)
        user_id = payload.get('userId')

        if not user_id:
            raise AuthenticationFailed("Token payload missing userId")

        try:
            user_doc = db.Users.find_one({'_id': ObjectId(user_id)})
        except Exception:
            raise AuthenticationFailed("Invalid user ID format in token")

        if not user_doc:
            raise AuthenticationFailed("User not found")

        user = MongoUser(user_doc)
        return (user, token)
