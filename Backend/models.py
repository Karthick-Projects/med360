from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
class LoginModel(BaseModel):
    phone: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    dob: str
    phone: str
    password: str
    confirmPassword: str

class Doctor(BaseModel):
    id: str
    name: str
    specialty: str
    contact: str
    status: str
    timeSlots: List[str]

class TimeSlot(BaseModel):
    id: str
    time: str
    available: bool

class CreateAppointmentModel(BaseModel):
    patient_id: str
    doctor_id: str
    date: str
    time: str
    reason: str
    mobilenumber: str
    status: str

class UserMasterCreate(BaseModel):
    userType: str
    userId: str
    password: str
    name: str
    roleOrSpec: Optional[str] = None
    contact: str
    status: Optional[str] = None
    timeSlots: Optional[List[str]] = None
    profile_pic: Optional[str] = None

class UserMasterResponse(BaseModel):
    message: str
    user_id: str

class PatientCreate(BaseModel):
    patientId: str
    password: str
    name: str
    age: int
    dob: str
    gender: str
    mobile: str
    address: str
    disease: str
    assignedDoctor: str
    status: Optional[str] = "Active"


class PatientResponse(BaseModel):
    message: str
    patientId: str

class AdmissionCreate(BaseModel):
    patientId: str
    admissionType: str
    ward: str
    bedNumber: str

# Request body model
class DoctorAssignment(BaseModel):
    admissionId: str
    patientId: str
    doctorName: str
    department: str
    doctorRole: str
    notes: Optional[str] = None  # Optional field

class StaffCreate(BaseModel):
    staffId: str
    name: str
    password: str
    role: str
    department: str
    shift: str
    contactNumber: str
    availability: str = "Available"

class StaffResponse(BaseModel):
    staffId: str
    message: str

class MedicineCreate(BaseModel):
    medicineId: Optional[str] = None  # can be auto-generated
    medicineName: str
    composition: Optional[str] = None
    category: Optional[str] = None
    batchNumber: str
    expiryDate: str
    price: float
    stockQty: int
    supplier: Optional[str] = None

class MedicineResponse(BaseModel):
    medicineId: str
    message: str

class LabReportCreate(BaseModel):
    patientId: str
    patientName: str
    testName: str
    technician: str
    bp: str
    bloodSugar: str
    temperature: Optional[str] = None
    pulse: Optional[str] = None
    metrics: Optional[str] = None
    remarks: Optional[str] = None
    reportUploaded: bool = False

class LabReportResponse(BaseModel):
    reportId: str
    message: str

class PatientProfile(BaseModel):
    id: str
    user_id: str
    role: str
    name: str
    dob: str
    mobile: str


class Medication(BaseModel):
    name: str
    dosageMorning: Optional[str] = None
    dosageAfternoon: Optional[str] = None
    dosageNight: Optional[str] = None
    instructions: Optional[str] = None


class PrescriptionPayload(BaseModel):
    doctorName: str
    doctorRole: str
    doctorDepartment: str
    patientId: str
    patientName: str
    disease: Optional[str] = None   # ✅ FIX
    medications: list[Medication]
    timestamp: Optional[datetime] = None

class PrescriptionOut(BaseModel):
    id: str
    patientId: str
    doctorName: str
    doctorRole: str
    doctorDepartment: str
    disease: Optional[str] = None
    status: str
    dateIssued: Optional[datetime] = None   # ✅ REQUIRED
    medications: list[Medication]


class VitalsCreate(BaseModel):
    patient_id: str
    heart_rate: Optional[int] = None
    blood_pressure: Optional[str] = None
    temperature: Optional[float] = None
    spo2: Optional[int] = None
    respiration_rate: Optional[int] = None
    blood_sugar: Optional[int] = None
