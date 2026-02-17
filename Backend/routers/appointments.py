from fastapi import APIRouter, HTTPException,Body
from typing import List
from datetime import datetime, timedelta
from models import CreateAppointmentModel, TimeSlot
from database import appointments_collection, doctors_collection  # MongoDB collections
from bson import ObjectId

router = APIRouter(prefix="/appointments", tags=["appointments"])


# --- Helper: Generate AM/PM slots ---
def generate_slots(start_hour=9, end_hour=17):
    """Generate 1-hour slots in AM/PM format from start_hour to end_hour."""
    slots = []
    for hour in range(start_hour, end_hour):
        dt = datetime.strptime(f"{hour}:00", "%H:%M")
        slot_time = dt.strftime("%I:%M %p")  # AM/PM format
        slots.append(slot_time)
    return slots


# --- GET TIME SLOTS ---
@router.get("/timeslots", response_model=List[TimeSlot])
def get_time_slots(doctor_id: str, date: str):
    """
    Return all time slots for a doctor on a given date.
    Marks slots as available or booked.
    """
    try:
        # Fetch doctor
        doctor = doctors_collection.find_one({"doctorId": doctor_id})
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        # Use doctor's working hours if defined, else default 9-5
        start_hour = doctor.get("start_hour", 9)
        end_hour = doctor.get("end_hour", 17)

        all_slots = generate_slots(start_hour, end_hour)

        # Get booked times for this doctor on the date
        booked_appts = appointments_collection.find({
            "doctor_id": doctor_id,
            "date": date
        })
        booked_times = [appt["time"] for appt in booked_appts]

        # Build slots list with availability
        slots = []
        for idx, time_str in enumerate(all_slots, start=1):
            slots.append(TimeSlot(
                id=str(idx),
                time=time_str,
                available=time_str not in booked_times
            ))

        return slots

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch time slots: {str(e)}")


# --- CREATE APPOINTMENT ---
@router.post("/create")
def create_appointment(data: CreateAppointmentModel):
    """
    Book a new appointment for a doctor.
    """
    try:
        # Check if the slot is already booked
        existing = appointments_collection.find_one({
            "doctor_id": data.doctor_id,
            "date": data.date,
            "time": data.time
        })
        if existing:
            raise HTTPException(status_code=400, detail="Time slot already booked")

        # Insert new appointment
        appointments_collection.insert_one(data.dict())
        return {"detail": "Appointment booked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create appointment: {str(e)}")

@router.get("/doctor/{doctor_id}/today")
def get_today_appointments(doctor_id: str):
    try:
        today_iso = datetime.now().strftime("%Y-%m-%d")

        cursor = appointments_collection.find({
            "doctor_id": doctor_id,
            "date": today_iso
        })

        appointments = []
        for doc in cursor:
            appointments.append({
                "id": str(doc["_id"]),
                "patientId": doc.get("patient_id"),
                "phone": doc.get("mobilenumber"),
                "reason": doc.get("reason"),
                "date": doc.get("date"),
                "time": doc.get("time"),
                "status": doc.get("status")  # Pending or Completed
            })

        return appointments

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/status")
def update_appointment_status(payload: dict = Body(...)):
    """
    Expects JSON: {"id": "65ae...", "status": "Completed"}
    """
    appointment_id = payload.get("id")
    new_status = payload.get("status")

    if not appointment_id or not new_status:
        raise HTTPException(status_code=400, detail="Missing id or status in request")

    try:
        # Convert the string ID to a MongoDB ObjectId
        obj_id = ObjectId(appointment_id)
        
        # Perform the update
        result = appointments_collection.update_one(
            {"_id": obj_id},
            {"$set": {"status": new_status}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Appointment not found")

        return {"message": "Status updated successfully", "status": new_status}

    except Exception as e:
        print(f"Update Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")
