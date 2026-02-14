from fastapi import APIRouter, HTTPException
from database import lab_report_collection, users_collection,prescription_collection
from models import PatientProfile,PrescriptionOut
from typing import List

router = APIRouter(prefix="/patient", tags=["Lab Reports"])

@router.get("/lab-reports/{patientId}")
def get_lab_reports_by_patient(patientId: str):

    # Fetch patient
    patient = users_collection.find_one(
        {"user_id": patientId, "role": "patient"},
        {"_id": 0, "name": 1}
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
        patient = users_collection.find_one(
            {"user_id": patient_id}
        )
        print(patient)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        return {
            "id": str(patient["_id"]),
            "user_id": patient["user_id"],
            "role": patient["role"],
            "name": patient["name"],
            "dob": patient["dob"],
            "age": patient["age"],
            "gender": patient["gender"],
            "mobile": patient["mobile"],
            "address": patient["address"],
            "disease": patient["disease"],
            "assignedDoctor": patient["assignedDoctor"],
            "status": patient["status"],
        }

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")


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
            "disease": doc.get("disease", ""),
            "status": doc.get("status", "Current"),
            "dateIssued": doc.get("timestamp", ""),
            "medications": doc.get("medications", [])
        })
    if not prescriptions:
        raise HTTPException(status_code=404, detail="No prescriptions found for this patient")
    return prescriptions