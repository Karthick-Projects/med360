from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import users_collection,doctors_collection
import random
from models import RegisterRequest,LoginModel,RegisterRequest
from bson import ObjectId

router = APIRouter()

def generate_patient_id():
    return f"PID-{random.randint(100000, 999999)}"


# ----------- ROUTES -----------

@router.post("/register")
def register_user(data: RegisterRequest):
    # Validate passwords
    if data.password != data.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Check if phone already exists
    if users_collection.find_one({"phone": data.phone}):
        raise HTTPException(status_code=400, detail="Phone already registered")

    # Generate patient ID
    user_id = f"PID-{ObjectId()}"

    # Save in DB
    result = users_collection.insert_one({
        "user_id": user_id,
        "name": data.name,
        "dob": data.dob,
        "phone": data.phone,
        "password": data.password,  # 🔒 Ideally hash this!
        "role": "patient"
    })
    return {"message": "Registered successfully", "user_id": user_id}


@router.post("/login")
def login_user(data: LoginModel):
    user = None
    role = None

    # 1️⃣ Try users collection first
    user = users_collection.find_one({"user_id": data.phone})
    if not user:
        user = users_collection.find_one({"phone": data.phone})

    # 2️⃣ If not found, try doctors collection
    if not user:
        user = doctors_collection.find_one({"doctorId": data.phone})
        if not user:
            user = doctors_collection.find_one({"phone": data.phone})
        if user:
            role = "doctor"

    # 3️⃣ If found in users collection
    if user and not role:
        role = user.get("role", "patient")

    # 4️⃣ Validate password
    if not user or user["password"] != data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return {
        "message": "Login successful",
        "user_id": user.get("user_id") or user.get("doctorId"),
        "name": user["name"],
        "role": role
    }

