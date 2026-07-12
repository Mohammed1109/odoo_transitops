from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# Base Schema
# ==========================================================

class DriverBase(BaseModel):

    # ==========================================================
    # Personal Information
    # ==========================================================

    first_name: str = Field(..., max_length=100)

    last_name: str = Field(..., max_length=100)

    employee_id: str = Field(..., max_length=50)

    email: Optional[str] = None

    phone_number: str = Field(..., max_length=20)

    emergency_contact: Optional[str] = None

    address: Optional[str] = None

    city: Optional[str] = None

    state: Optional[str] = None

    country: Optional[str] = None

    postal_code: Optional[str] = None

    date_of_birth: Optional[date] = None

    gender: Optional[str] = None

    blood_group: Optional[str] = None

    # ==========================================================
    # Employment
    # ==========================================================

    joining_date: Optional[date] = None

    designation: Optional[str] = None

    department: Optional[str] = None

    experience_years: int = Field(0, ge=0)

    employee_type: str = "Permanent"

    # ==========================================================
    # Driving License
    # ==========================================================

    license_number: str

    license_category: str

    license_issue_date: Optional[date] = None

    license_expiry_date: date

    issuing_authority: Optional[str] = None

    # ==========================================================
    # Safety
    # ==========================================================

    safety_score: float = Field(100, ge=0, le=100)

    accident_count: int = Field(0, ge=0)

    violation_count: int = Field(0, ge=0)

    suspension_reason: Optional[str] = None

    # ==========================================================
    # Driver Statistics
    # ==========================================================

    total_completed_trips: int = Field(0, ge=0)

    total_distance_km: float = Field(0, ge=0)

    total_driving_hours: float = Field(0, ge=0)

    average_rating: float = Field(5, ge=0, le=5)

    # ==========================================================
    # Current Status
    # ==========================================================

    status: str = "Available"

    current_vehicle_id: Optional[int] = None

    # ==========================================================
    # Documents
    # ==========================================================

    aadhaar_number: Optional[str] = None

    pan_number: Optional[str] = None

    profile_photo: Optional[str] = None

    driving_license_document: Optional[str] = None

    medical_certificate: Optional[str] = None

    police_verification_document: Optional[str] = None

    # ==========================================================
    # GPS
    # ==========================================================

    device_id: Optional[str] = None

    last_known_latitude: Optional[float] = None

    last_known_longitude: Optional[float] = None

    # ==========================================================
    # Remarks
    # ==========================================================

    remarks: Optional[str] = None

    is_active: bool = True


# ==========================================================
# Create Driver
# ==========================================================

class DriverCreate(DriverBase):
    pass


# ==========================================================
# Update Driver
# ==========================================================

class DriverUpdate(BaseModel):

    first_name: Optional[str] = None

    last_name: Optional[str] = None

    employee_id: Optional[str] = None

    email: Optional[str] = None

    phone_number: Optional[str] = None

    emergency_contact: Optional[str] = None

    address: Optional[str] = None

    city: Optional[str] = None

    state: Optional[str] = None

    country: Optional[str] = None

    postal_code: Optional[str] = None

    date_of_birth: Optional[date] = None

    gender: Optional[str] = None

    blood_group: Optional[str] = None

    joining_date: Optional[date] = None

    designation: Optional[str] = None

    department: Optional[str] = None

    experience_years: Optional[int] = Field(None, ge=0)

    employee_type: Optional[str] = None

    license_number: Optional[str] = None

    license_category: Optional[str] = None

    license_issue_date: Optional[date] = None

    license_expiry_date: Optional[date] = None

    issuing_authority: Optional[str] = None

    safety_score: Optional[float] = Field(None, ge=0, le=100)

    accident_count: Optional[int] = Field(None, ge=0)

    violation_count: Optional[int] = Field(None, ge=0)

    suspension_reason: Optional[str] = None

    total_completed_trips: Optional[int] = Field(None, ge=0)

    total_distance_km: Optional[float] = Field(None, ge=0)

    total_driving_hours: Optional[float] = Field(None, ge=0)

    average_rating: Optional[float] = Field(None, ge=0, le=5)

    status: Optional[str] = None

    current_vehicle_id: Optional[int] = None

    aadhaar_number: Optional[str] = None

    pan_number: Optional[str] = None

    profile_photo: Optional[str] = None

    driving_license_document: Optional[str] = None

    medical_certificate: Optional[str] = None

    police_verification_document: Optional[str] = None

    device_id: Optional[str] = None

    last_known_latitude: Optional[float] = None

    last_known_longitude: Optional[float] = None

    remarks: Optional[str] = None

    is_active: Optional[bool] = None


# ==========================================================
# Driver Status Update
# ==========================================================

class DriverStatusUpdate(BaseModel):

    status: str


# ==========================================================
# Driver Safety Update
# ==========================================================

class DriverSafetyUpdate(BaseModel):

    safety_score: float = Field(..., ge=0, le=100)


# ==========================================================
# Driver Location Update
# ==========================================================

class DriverLocationUpdate(BaseModel):

    last_known_latitude: float

    last_known_longitude: float


# ==========================================================
# Driver Response
# ==========================================================

class DriverResponse(DriverBase):

    id: int

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    last_location_update: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# Driver Dropdown
# ==========================================================

class DriverDropdown(BaseModel):

    id: int

    first_name: str

    last_name: str

    license_number: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# Driver Statistics
# ==========================================================

class DriverStatistics(BaseModel):

    total: int

    available: int

    on_trip: int

    off_duty: int

    suspended: int


# ==========================================================
# API Response
# ==========================================================

class DriverAPIResponse(BaseModel):

    success: bool

    message: str

    data: Optional[dict] = None