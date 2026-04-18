from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import jwt
from bson import ObjectId
from fastapi import HTTPException, status
from passlib.context import CryptContext

from database import convert_objectid_to_string, get_users_collection


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def _normalized_email(email: str) -> str:
    return email.strip().lower()


def _jwt_config() -> tuple[str, str, int]:
    secret = os.getenv("JWT_SECRET", "dev-quickresolveai-secret")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    expires_minutes = int(os.getenv("JWT_EXP_MINUTES", "60"))
    return secret, algorithm, expires_minutes


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def _build_user_response(user_doc: dict) -> dict:
    safe_user = convert_objectid_to_string(user_doc)
    return {
        "id": safe_user["id"],
        "name": safe_user["name"],
        "email": safe_user["email"],
        "created_at": safe_user["created_at"],
    }


def create_user(name: str, email: str, password: str) -> dict:
    users_collection = get_users_collection()
    normalized_email = _normalized_email(email)

    existing_user = users_collection.find_one({"email": normalized_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user_doc = {
        "name": name.strip(),
        "email": normalized_email,
        "password_hash": hash_password(password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return _build_user_response(user_doc)


def authenticate_user(email: str, password: str) -> dict:
    users_collection = get_users_collection()
    normalized_email = _normalized_email(email)
    user_doc = users_collection.find_one({"email": normalized_email})

    if not user_doc or not verify_password(password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return _build_user_response(user_doc)


def create_access_token(user: dict) -> str:
    secret, algorithm, expires_minutes = _jwt_config()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "iat": int(now.timestamp()),
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, secret, algorithm=algorithm)


def get_current_user_from_token(token: str) -> dict:
    secret, algorithm, _ = _jwt_config()

    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc

    user_id = payload.get("sub")
    if not user_id or not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    users_collection = get_users_collection()
    user_doc = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return _build_user_response(user_doc)