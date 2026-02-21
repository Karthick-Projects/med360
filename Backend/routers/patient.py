from fastapi import APIRouter, HTTPException
from database import lab_report_collection, users_collection,prescription_collection,vitals_collection
from models import PatientProfile,PrescriptionOut
from typing import List
from datetime import datetime
router = APIRouter(prefix="/patient", tags=["Lab Reports"])

@router.get("/lab-reports/{patientId}")
def get_lab_reports_by_patient(patientId: str):

    # Fetch patient
    patient = users_collection.find_one(
        {"user_id": patientId, "role": "patient"}
    )

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    reports = list(lab_report_collection.find({"patientId": patientId}))

    if not reports:
        raise HTTPException(status_code=404, detail="No lab reports found")

    for r in reports:
        r["_id"] = str(r["_id"])

    return {
        "patientId": patientId,
        "patientName": patient["name"],
        "reports": reports
    }


@router.get("/{patient_id}", response_model=PatientProfile)
def get_patient_profile(patient_id: str):
    try:
        print("Patient ID:",patient_id)
        patient = users_collection.find_one({
            "$or": [
                {"user_id": patient_id},
                {"mobile": patient_id}
            ]
        })
        print(patient)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        return {
            "id": str(patient["_id"]),
            "user_id": patient["user_id"],
            "role": patient["role"],
            "name": patient["name"],
            "dob": patient["dob"],
            "mobile": patient["mobile"]
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient_id")


@router.get("/prescriptions/{patient_id}", response_model=List[PrescriptionOut])
def get_prescriptions(patient_id: str):
    prescriptions = []

    cursor = prescription_collection.find({"patientId": patient_id})

    for doc in cursor:
        prescriptions.append({
            "id": str(doc["_id"]),
            "patientId": doc["patientId"],
            "doctorName": doc["doctorName"],
            "doctorRole": doc["doctorRole"],
            "doctorDepartment": doc["doctorDepartment"],
            "disease": doc.get("disease"),
            "status": doc.get("status", "Current"),
            "dateIssued": (
                doc["timestamp"]
                if isinstance(doc.get("timestamp"), datetime)
                else None
            ),
            "medications": doc.get("medications", [])
        })

    if not prescriptions:
        raise HTTPException(
            status_code=404,
            detail="No prescriptions found for this patient"
        )

    return prescriptions



@router.get("/vitals/{patient_id}")
def get_latest_vitals(patient_id: str):
    try:
        vitals = vitals_collection.find_one(
            {"patient_id": patient_id},
            sort=[("created_at", -1)]
        )

        if not vitals:
            raise HTTPException(status_code=404, detail="No vitals found")

        return {
            "heart_rate": vitals.get("heart_rate"),
            "blood_pressure": vitals.get("blood_pressure"),
            "temperature": vitals.get("temperature"),
            "spo2": vitals.get("spo2"),
            "respiration_rate": vitals.get("respiration_rate"),
            "blood_sugar": vitals.get("blood_sugar"),
            "created_at": vitals.get("created_at")
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch vitals"
        )


@router.get("/vitals/all/{patient_id}")
def get_all_vitals(patient_id: str):
    try:
        cursor = vitals_collection.find(
            {"patient_id": patient_id}
        ).sort("created_at", -1)

        vitals_list = []

        for vitals in cursor:
            vitals_list.append({
                "id": str(vitals["_id"]),
                "heart_rate": vitals.get("heart_rate"),
                "blood_pressure": vitals.get("blood_pressure"),
                "temperature": vitals.get("temperature"),
                "spo2": vitals.get("spo2"),
                "respiration_rate": vitals.get("respiration_rate"),
                "blood_sugar": vitals.get("blood_sugar"),
                "created_at": vitals.get("created_at")
            })

        if not vitals_list:
            raise HTTPException(status_code=404, detail="No vitals found")

        return vitals_list

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch vitals history"
        )