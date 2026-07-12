from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


# ==========================================================
# Base Schema
# ==========================================================

class DriverBase(BaseModel):

    first_name: str = Field(..., max_length=100)

    last_name: str = Field(..., max_length=100)

    employee_id: Optional[str] = None

    email: Optional[str] = None

    phone_number: str

    emergency_contact: Optional[str] = None

    address: Optional[str] = None

    city: Optional[str] = None

    state: Optional[str] = None

    country: Optional[str] = None

    postal_code: Optional[str] = None

    license_number: str

    license_category: str

    license_expiry_date: date

    date_of_birth: Optional[date] = None

    joining_date: Optional[date] = None

    experience_years: Optional[int] = 0

    safety_score: float = 100

    status: str = "Available"

    profile_image: Optional[str] = None

    notes: Optional[str] = None

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

    license_number: Optional[str] = None

    license_category: Optional[str] = None

    license_expiry_date: Optional[date] = None

    date_of_birth: Optional[date] = None

    joining_date: Optional[date] = None

    experience_years: Optional[int] = None

    safety_score: Optional[float] = None

    status: Optional[str] = None

    profile_image: Optional[str] = None

    notes: Optional[str] = None

    is_active: Optional[bool] = None


# ==========================================================
# Driver Status
# ==========================================================

class DriverStatusUpdate(BaseModel):

    status: str


# ==========================================================
# Safety Score
# ==========================================================

class DriverSafetyScoreUpdate(BaseModel):

    safety_score: float


# ==========================================================
# Driver Response
# ==========================================================

class DriverResponse(DriverBase):

    id: int

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# Dropdown
# ==========================================================

class DriverDropdown(BaseModel):

    id: int

    first_name: str

    last_name: str

    license_number: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# Statistics
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