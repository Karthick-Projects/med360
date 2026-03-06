from fastapi import APIRouter, HTTPException, Body
from datetime import datetime
from database import appointments_collection
from models import CreateAppointmentModel,DischargeUpdate
from bson import ObjectId

router = APIRouter(prefix="/appointments", tags=["appointments"])

MAX_STANDARD = 25
MAX_EMERGENCY = 30 # Standard 25 + 5 Emergency


# --- GET REGISTRATION STATUS ---
@router.get("/doctor/{doctor_id}/registrations")
def get_registration_status(doctor_id: str, date: str):
    """
    Returns counts. We show the 'max' as 25 by default, 
    but the frontend handles the toggle logic.
    """
    try:
        count = appointments_collection.count_documents({
            "doctor_id": doctor_id,
            "date": date
        })

        return {
            "doctor_id": doctor_id,
            "date": date,
            "filled": count,
            "remaining": MAX_STANDARD - count,
            "max_standard": MAX_STANDARD,
            "max_emergency": MAX_EMERGENCY
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- CREATE APPOINTMENT ---
@router.post("/create")
def create_appointment(data: CreateAppointmentModel):
    try:
        # 1. Check current count for this doctor/date
        count = appointments_collection.count_documents({
            "doctor_id": data.doctor_id,
            "date": data.date
        })

        # 2. Determine limit based on the incoming request type
        # If it's an emergency booking, we allow up to 30.
        # If standard, we stop at 25.
        current_limit = MAX_EMERGENCY if data.is_emergency else MAX_STANDARD

        if count >= current_limit:
            limit_type = "Emergency" if data.is_emergency else "Standard"
            raise HTTPException(
                status_code=400,
                detail=f"{limit_type} registration limit reached ({current_limit} slots)"
            )

        # 3. Prepare data
        appointment = data.dict()
        appointment["created_at"] = datetime.now()
        
        # If it's an admin emergency booking, we might want to auto-confirm it
        if data.is_emergency:
            appointment["status"] = "Confirmed"

        appointments_collection.insert_one(appointment)

        return {
            "message": "Appointment registered successfully",
            "token_number": count + 1,
            "type": "Emergency" if data.is_emergency else "Standard"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- DOCTOR TODAY LIST ---
@router.get("/doctor/{doctor_id}/today")
def get_today_appointments(doctor_id: str):
    today = datetime.now().strftime("%Y-%m-%d")

    # Change: Added .sort([("is_emergency", -1), ("created_at", 1)])
    # This sorts by Emergency FIRST (True/1 comes before False/0), 
    # then by time of booking.
    cursor = appointments_collection.find({
        "doctor_id": doctor_id,
        "date": today
    }).sort([
        ("is_emergency", -1), 
        ("created_at", 1)
    ])

    appointments = []

    for doc in cursor:
        appointments.append({
            "id": str(doc["_id"]),
            "patientId": doc.get("patient_id"),
            "phone": doc.get("mobilenumber"),
            "reason": doc.get("reason"),
            "date": doc.get("date"),
            "status": doc.get("status"),
            "is_emergency": doc.get("is_emergency", False) # <--- Ensure this is returned
        })

    return appointments

# --- UPDATE STATUS ---
@router.put("/status")
def update_status(payload: dict = Body(...)):

    appointment_id = payload.get("id")
    status = payload.get("status")

    if not appointment_id or not status:
        raise HTTPException(status_code=400, detail="Missing id or status")

    result = appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return {"message": "Status updated"}

@router.get("/doctor/{doctor_id}/ipd")
def get_doctor_in_patients(doctor_id: str):
    # Query for patients assigned to this doctor who are currently 'Admitted'
    cursor = appointments_collection.find({
        "doctor_id": doctor_id,
        "is_ipd": True,
        "status": "Admitted"
    })
    
    patients = []
    for doc in cursor.to_list(length=100):
        patients.append({
            "id": str(doc["_id"]),
            "patient_name": doc.get("patient_name"),
            "age": doc.get("age"),
            "gender": doc.get("gender"),
            "ward_no": doc.get("ward_no"),
            "bed_no": doc.get("bed_no"),
            "admission_date": doc.get("admission_date"),
            "reason": doc.get("reason")
        })
    return patients

@router.put("/{patient_id}/discharge")
def discharge_patient(patient_id: str, data: DischargeUpdate):
    try:
        # Update the document: Set status to Discharged and save the date
        result = appointments_collection.update_one(
            {"_id": ObjectId(patient_id)},
            {
                "$set": {
                    "status": "Discharged",
                    "discharge_date": data.discharge_date,
                    "is_ipd": False # Optional: Move them out of IPD active list
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Patient record not found")
            
        return {"message": "Patient discharged successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.put("/{patient_id}/finalize-discharge")
def finalize_discharge(patient_id: str):
    from datetime import datetime
    
    result = appointments_collection.update_one(
        {"_id": ObjectId(patient_id)},
        {
            "$set": {
                "status": "Discharged",
                "is_ipd": False,
                "admin_confirmed_at": datetime.now().strftime("%Y-%m-%d %H:%M")
            }
        }
    )
    return {"message": "Patient records updated and bed cleared."}