from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


# ==========================================================
# Base Schema
# ==========================================================

class VehicleBase(BaseModel):

    registration_number: str = Field(..., max_length=50)

    vehicle_name: str

    vehicle_model: Optional[str] = None

    manufacturer: Optional[str] = None

    vehicle_type: str

    maximum_load_capacity: float = Field(..., ge=0)

    capacity_unit: str = "kg"

    odometer: float = Field(0, ge=0)

    acquisition_cost: float = Field(0, ge=0)

    purchase_date: Optional[date] = None

    color: Optional[str] = None

    chassis_number: Optional[str] = None

    engine_number: Optional[str] = None

    vin_number: Optional[str] = None

    fuel_type: Optional[str] = None

    fuel_tank_capacity: Optional[float] = Field(None, ge=0)

    gps_tracker_id: Optional[str] = None

    current_latitude: Optional[float] = None

    current_longitude: Optional[float] = None

    insurance_number: Optional[str] = None

    insurance_expiry: Optional[date] = None

    registration_expiry: Optional[date] = None

    permit_expiry: Optional[date] = None

    status: str = "Available"

    is_active: bool = True


# ==========================================================
# Create Vehicle
# ==========================================================

class VehicleCreate(VehicleBase):
    pass


# ==========================================================
# Update Vehicle
# ==========================================================

class VehicleUpdate(BaseModel):

    registration_number: Optional[str] = None

    vehicle_name: Optional[str] = None

    vehicle_model: Optional[str] = None

    manufacturer: Optional[str] = None

    vehicle_type: Optional[str] = None

    maximum_load_capacity: Optional[float] = Field(None, ge=0)

    capacity_unit: Optional[str] = None

    odometer: Optional[float] = Field(None, ge=0)

    acquisition_cost: Optional[float] = Field(None, ge=0)

    purchase_date: Optional[date] = None

    color: Optional[str] = None

    chassis_number: Optional[str] = None

    engine_number: Optional[str] = None

    vin_number: Optional[str] = None

    fuel_type: Optional[str] = None

    fuel_tank_capacity: Optional[float] = Field(None, ge=0)

    gps_tracker_id: Optional[str] = None

    current_latitude: Optional[float] = None

    current_longitude: Optional[float] = None

    insurance_number: Optional[str] = None

    insurance_expiry: Optional[date] = None

    registration_expiry: Optional[date] = None

    permit_expiry: Optional[date] = None

    status: Optional[str] = None

    is_active: Optional[bool] = None


# ==========================================================
# Status Update
# ==========================================================

class VehicleStatusUpdate(BaseModel):

    status: str


# ==========================================================
# Odometer Update
# ==========================================================

class VehicleOdometerUpdate(BaseModel):

    odometer: float


# ==========================================================
# GPS Update
# ==========================================================

class VehicleLocationUpdate(BaseModel):

    current_latitude: float

    current_longitude: float


# ==========================================================
# Response
# ==========================================================

class VehicleResponse(VehicleBase):

    id: int

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# Dropdown
# ==========================================================

class VehicleDropdown(BaseModel):

    id: int

    vehicle_name: str

    registration_number: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# Statistics
# ==========================================================

class VehicleStatistics(BaseModel):

    total: int

    available: int

    on_trip: int

    in_shop: int

    retired: int


# ==========================================================
# API Response
# ==========================================================

class VehicleAPIResponse(BaseModel):

    success: bool

    message: str

    data: Optional[dict] = None