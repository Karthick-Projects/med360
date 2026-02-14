from fastapi import APIRouter, HTTPException
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
