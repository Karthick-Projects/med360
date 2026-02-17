from pydantic import BaseModel, Field
from typing import List, Optional
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
    status: Optional[str] = "Active"
    timeSlots: Optional[List[str]] = []  # only for doctors

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
    dosageMorning: str
    dosageAfternoon: str
    dosageNight: str
    instructions: str

class PrescriptionPayload(BaseModel):
    doctorName: str
    doctorRole: str
    doctorDepartment: str
    patientId: str
    patientName: str
    disease: str
    medications: List[Medication]
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class PrescriptionOut(BaseModel):
    id: str
    patientId: str
    doctorName: str
    doctorRole: str
    doctorDepartment: str
    disease: str
    status: str
    dateIssued: str
    medications: list[Medication]


class VitalsCreate(BaseModel):
    patient_id: str
    heart_rate: Optional[int] = None
    blood_pressure: Optional[str] = None
    temperature: Optional[float] = None
    spo2: Optional[int] = None
    respiration_rate: Optional[int] = None
    blood_sugar: Optional[int] = None
