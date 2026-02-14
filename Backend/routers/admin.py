from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from models import *
from database import users_collection, doctors_collection, admin_collection,admission_collection,staff_collection,pharmacy_collection,lab_report_collection,vitals_collection
from datetime import datetime
router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/create-user", response_model=UserMasterResponse)
def create_user(user: UserMasterCreate):
    user_type = user.userType.lower()

    if user_type not in ["patient", "doctor", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid user type")

    # Check duplicates
    if (
        users_collection.find_one({"userId": user.userId})
        or doctors_collection.find_one({"doctorId": user.userId})
        or admin_collection.find_one({"adminId": user.userId})
    ):
        raise HTTPException(status_code=400, detail="User ID already exists")


    if user_type == "admin":
        admin_doc = {
            "adminId": user.userId,
            "password": user.password,
            "name": user.name,
            "role": user.roleOrSpec or "Admin",
            "contact": user.contact,
            "status": user.status,
        }
        admin_collection.insert_one(admin_doc)

    elif user_type == "doctor":
        # Validate doctor availability
        if not user.timeSlots or len(user.timeSlots) == 0:
            raise HTTPException(status_code=400, detail="Doctor timeSlots are required")

        # Insert into users
        doctors_collection.insert_one({
            "doctorId": user.userId,
            "role": user_type,
            "password": user.password,
            "name": user.name,
            "roleOrSpec": user.roleOrSpec,
            "contact": user.contact,
            "status": user.status,
            "timeSlots": user.timeSlots
        })


    else:  # patient
        users_collection.insert_one({
            "userId": user.userId,
            "userType": user_type,
            "password": user.password,
            "name": user.name,
            "roleOrSpec": user.roleOrSpec,
            "contact": user.contact,
            "status": user.status,
        })

    return {"message": f"{user.userType} created successfully", "user_id": user.userId}


@router.post("/patient-register", response_model=PatientResponse)
def register_patient(patient: PatientCreate):

    # Check duplicate patient
    if users_collection.find_one({"user_id": patient.patientId}):
        raise HTTPException(
            status_code=400,
            detail="Patient already exists"
        )

    patient_doc = {
        "user_id": patient.patientId,
        "role": "patient",
        "dob": patient.dob,
        "password": patient.password,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "mobile": patient.mobile,
        "address": patient.address,
        "disease": patient.disease,
        "assignedDoctor": patient.assignedDoctor,
        "status": patient.status,
    }

    users_collection.insert_one(patient_doc)

    return {
        "message": "Patient registered successfully",
        "patientId": patient.patientId
    }


@router.get("/{patient_id}")
def get_patient_by_id(patient_id: str):

    patient = users_collection.find_one({
        "userId": patient_id,
        "userType": "patient"
    })

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    return {
        "patientId": patient.get("userId"),
        "name": patient.get("name"),
        "age": patient.get("age"),
        "gender": patient.get("gender"),
        "mobile": patient.get("mobile"),
        "address": patient.get("address"),
        "disease": patient.get("disease"),
        "assignedDoctor": patient.get("assignedDoctor"),
        "status": patient.get("status"),
    }

@router.post("/admission-create")
def create_admission(admission: AdmissionCreate):

    # Check patient exists
    patient = users_collection.find_one({
        "userId": admission.patientId,
        "userType": "patient"
    })

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Generate Admission ID
    admission_id = "ADM-" + str(100000 + admission_collection.count_documents({}) + 1)

    admission_doc = {
        "admissionId": admission_id,
        "patientId": admission.patientId,
        "patientName": patient.get("name"),
        "admissionType": admission.admissionType,
        "ward": admission.ward,
        "bedNumber": admission.bedNumber,
        "admissionDateTime": datetime.now().isoformat()
    }

    admission_collection.insert_one(admission_doc)

    return {"message": "Admission created successfully", "admissionId": admission_id}

@router.post("/doctor-department-assign")
def assign_doctor(assignment: DoctorAssignment):
    # 1️⃣ Validate admission exists
    admission = admission_collection.find_one({"admissionId": assignment.admissionId})
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    # 2️⃣ Validate patientId matches admission
    if admission.get("patientId") != assignment.patientId:
        raise HTTPException(status_code=400, detail="Patient ID does not match admission")

    # 3️⃣ Append doctor assignment to the admission document
    update_result = admission_collection.update_one(
        {"admissionId": assignment.admissionId},
        {"$set": {
            "doctorName": assignment.doctorName,
            "department": assignment.department,
            "doctorRole": assignment.doctorRole
        }}
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update admission with doctor assignment")

    return {
        "message": "Doctor assigned successfully",
        "admissionId": assignment.admissionId,
        "patientId": assignment.patientId
    }

@router.get("/get-user/{userId}")
def get_user(userId: str):
    user = users_collection.find_one({"userId": userId}) \
           or doctors_collection.find_one({"doctorId": userId}) \
           or admin_collection.find_one({"adminId": userId})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

@router.get("/admissions/{admissionId}")
def get_admission(admissionId: str):
    admission = admission_collection.find_one({"admissionId": admissionId})
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    admission["_id"] = str(admission["_id"])
    return admission

@router.post("/staff-register", response_model=StaffResponse)
def register_staff(staff: StaffCreate):
    # Check if staff already exists
    if staff_collection.find_one({"staffId": staff.staffId}):
        raise HTTPException(status_code=400, detail="Staff ID already exists")

    staff_doc = {
        "staffId": staff.staffId,
        "name": staff.name,
        "password": staff.password,  # Ideally hashed!
        "role": staff.role,
        "department": staff.department,
        "shift": staff.shift,
        "contactNumber": staff.contactNumber,
        "availability": staff.availability,
    }

    staff_collection.insert_one(staff_doc)

    return {"message": "Staff registered successfully", "staffId": staff.staffId}

@router.post("/medicine-add", response_model=MedicineResponse)
def add_medicine(med: MedicineCreate):
    # Auto-generate medicineId if not provided
    if not med.medicineId:
        med.medicineId = "MED-" + str(1000 + pharmacy_collection.count_documents({}) + 1)

    # Check duplicate batch number for same medicine
    existing = pharmacy_collection.find_one({
        "medicineName": med.medicineName,
        "batchNumber": med.batchNumber
    })
    if existing:
        raise HTTPException(status_code=400, detail="Medicine with this batch already exists")

    med_doc = med.dict()
    pharmacy_collection.insert_one(med_doc)

    return {"medicineId": med.medicineId, "message": "Medicine added successfully"}

@router.post("/lab-report-add", response_model=LabReportResponse)
def add_lab_report(report: LabReportCreate):
    # Check if patient exists
    patient = users_collection.find_one({"user_id": report.patientId, "role": "patient"})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Generate report ID
    report_id = "LAB-" + str(1000 + lab_report_collection.count_documents({}) + 1)

    report_doc = report.dict()
    report_doc["reportId"] = report_id
    report_doc["createdAt"] = datetime.now().isoformat()

    lab_report_collection.insert_one(report_doc)

    return {"reportId": report_id, "message": "Lab report saved successfully"}


@router.post("/vitals/update")
def update_patient_vitals(vitals: VitalsCreate):
    try:
        print("Id:",vitals.patient_id)
        # 🔍 Verify patient exists
        patient = users_collection.find_one({
            "$or": [
                {"user_id": vitals.patient_id},
                {"mobile": vitals.patient_id}
            ]
        })
        print(patient)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        vitals_doc = {
            "patient_id": vitals.patient_id,
            "heart_rate": vitals.heart_rate,
            "blood_pressure": vitals.blood_pressure,
            "temperature": vitals.temperature,
            "spo2": vitals.spo2,
            "respiration_rate": vitals.respiration_rate,
            "blood_sugar": vitals.blood_sugar,
            "created_at": datetime.utcnow(),
        }

        vitals_collection.insert_one(vitals_doc)

        return {
            "message": "Vitals updated successfully",
            "patient_id": vitals.patient_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update vitals")