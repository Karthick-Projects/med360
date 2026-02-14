from fastapi import APIRouter,HTTPException
from typing import List
from pydantic import BaseModel
from models import Doctor,PrescriptionPayload
from database import doctors_collection,prescription_collection
router = APIRouter(prefix="/doctors", tags=["doctors"])

@router.get("/", response_model=List[Doctor])
def list_doctors():
    docs = doctors_collection.find()  # Mongo cursor
    doctors = []
    for doc in docs:
        doctors.append(
            Doctor(
                id=str(doc.get("doctorId")),
                name=str(doc.get("name")),
                specialty=str(doc.get("roleOrSpec")).strip(),
                contact=str(doc.get("contact")),
                status=str(doc.get("status")).strip(),
                timeSlots=doc.get("timeSlots", [])
            )
        )
    return doctors

@router.get("/{user_id}")
def get_user(user_id: str):
    user = doctors_collection.find_one({"doctorId": user_id}, {"_id": 0})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.post("/save-prescriptions")
def create_prescription(payload: PrescriptionPayload):
    # Insert the prescription into MongoDB
    result = prescription_collection.insert_one(payload.dict())
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to save prescription")
    return {"message": "Prescription saved successfully", "id": str(result.inserted_id)}