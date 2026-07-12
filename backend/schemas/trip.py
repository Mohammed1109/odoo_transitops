from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# Base Schema
# ==========================================================

class TripBase(BaseModel):

    # ==========================================================
    # Vehicle & Driver
    # ==========================================================

    vehicle_id: int

    driver_id: int

    # ==========================================================
    # Route
    # ==========================================================

    source: str

    destination: str

    intermediate_stop: Optional[str] = None

    planned_distance_km: float = Field(..., ge=0)

    actual_distance_km: float = Field(0, ge=0)

    # ==========================================================
    # Cargo
    # ==========================================================

    cargo_name: Optional[str] = None

    cargo_description: Optional[str] = None

    cargo_weight: float = Field(..., gt=0)

    cargo_unit: str = "kg"

    # ==========================================================
    # Customer
    # ==========================================================

    customer_name: Optional[str] = None

    customer_phone: Optional[str] = None

    customer_email: Optional[str] = None

    # ==========================================================
    # Odometer
    # ==========================================================

    start_odometer: float = Field(0, ge=0)

    end_odometer: float = Field(0, ge=0)

    # ==========================================================
    # Time
    # ==========================================================

    scheduled_date: Optional[date] = None

    dispatch_time: Optional[datetime] = None

    estimated_arrival: Optional[datetime] = None

    completion_time: Optional[datetime] = None

    # ==========================================================
    # GPS
    # ==========================================================

    start_latitude: Optional[float] = None

    start_longitude: Optional[float] = None

    end_latitude: Optional[float] = None

    end_longitude: Optional[float] = None

    # ==========================================================
    # Fuel
    # ==========================================================

    estimated_fuel: float = Field(0, ge=0)

    actual_fuel: float = Field(0, ge=0)

    fuel_cost: float = Field(0, ge=0)

    # ==========================================================
    # Expenses
    # ==========================================================

    toll_cost: float = Field(0, ge=0)

    parking_cost: float = Field(0, ge=0)

    other_expense: float = Field(0, ge=0)

    # ==========================================================
    # Status
    # ==========================================================

    status: str = "Draft"

    priority: str = "Normal"

    # ==========================================================
    # Remarks
    # ==========================================================

    dispatched_by: Optional[str] = None

    dispatch_notes: Optional[str] = None

    completion_notes: Optional[str] = None

    cancellation_reason: Optional[str] = None

    is_active: bool = True


# ==========================================================
# Create Trip
# ==========================================================

class TripCreate(TripBase):
    pass


# ==========================================================
# Update Trip
# ==========================================================

class TripUpdate(BaseModel):

    vehicle_id: Optional[int] = None

    driver_id: Optional[int] = None

    source: Optional[str] = None

    destination: Optional[str] = None

    intermediate_stop: Optional[str] = None

    planned_distance_km: Optional[float] = Field(None, ge=0)

    actual_distance_km: Optional[float] = Field(None, ge=0)

    cargo_name: Optional[str] = None

    cargo_description: Optional[str] = None

    cargo_weight: Optional[float] = Field(None, gt=0)

    cargo_unit: Optional[str] = None

    customer_name: Optional[str] = None

    customer_phone: Optional[str] = None

    customer_email: Optional[str] = None

    start_odometer: Optional[float] = Field(None, ge=0)

    end_odometer: Optional[float] = Field(None, ge=0)

    scheduled_date: Optional[date] = None

    dispatch_time: Optional[datetime] = None

    estimated_arrival: Optional[datetime] = None

    completion_time: Optional[datetime] = None

    start_latitude: Optional[float] = None

    start_longitude: Optional[float] = None

    end_latitude: Optional[float] = None

    end_longitude: Optional[float] = None

    estimated_fuel: Optional[float] = Field(None, ge=0)

    actual_fuel: Optional[float] = Field(None, ge=0)

    fuel_cost: Optional[float] = Field(None, ge=0)

    toll_cost: Optional[float] = Field(None, ge=0)

    parking_cost: Optional[float] = Field(None, ge=0)

    other_expense: Optional[float] = Field(None, ge=0)

    status: Optional[str] = None

    priority: Optional[str] = None

    dispatched_by: Optional[str] = None

    dispatch_notes: Optional[str] = None

    completion_notes: Optional[str] = None

    cancellation_reason: Optional[str] = None

    is_active: Optional[bool] = None


# ==========================================================
# Dispatch Trip
# ==========================================================

class TripDispatch(BaseModel):

    dispatch_notes: Optional[str] = None


# ==========================================================
# Complete Trip
# ==========================================================

class TripComplete(BaseModel):

    end_odometer: float = Field(..., ge=0)

    actual_distance_km: float = Field(..., ge=0)

    actual_fuel: float = Field(0, ge=0)

    fuel_cost: float = Field(0, ge=0)

    toll_cost: float = Field(0, ge=0)

    parking_cost: float = Field(0, ge=0)

    other_expense: float = Field(0, ge=0)

    completion_notes: Optional[str] = None


# ==========================================================
# Cancel Trip
# ==========================================================

class TripCancel(BaseModel):

    cancellation_reason: str


# ==========================================================
# Response
# ==========================================================

class TripResponse(TripBase):

    id: int

    trip_number: str

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# Trip Statistics
# ==========================================================

class TripStatistics(BaseModel):

    total: int

    draft: int

    dispatched: int

    completed: int

    cancelled: int


# ==========================================================
# API Response
# ==========================================================

class TripAPIResponse(BaseModel):

    success: bool

    message: str

    data: Optional[dict] = None