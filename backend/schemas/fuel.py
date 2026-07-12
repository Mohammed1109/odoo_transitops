from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# Base Schema
# ==========================================================

class FuelBase(BaseModel):

    # ==========================================================
    # Vehicle / Driver / Trip
    # ==========================================================

    vehicle_id: int

    driver_id: Optional[int] = None

    trip_id: Optional[int] = None

    # ==========================================================
    # Fuel Information
    # ==========================================================

    fuel_date: date

    fuel_type: str

    liters: float = Field(
        ...,
        gt=0,
    )

    price_per_liter: float = Field(
        ...,
        gt=0,
    )

    # ==========================================================
    # Vehicle Reading
    # ==========================================================

    odometer: float = Field(
        ...,
        ge=0,
    )

    # ==========================================================
    # Fuel Station
    # ==========================================================

    fuel_station: Optional[str] = None

    station_location: Optional[str] = None

    # ==========================================================
    # Payment
    # ==========================================================

    payment_method: Optional[str] = None

    invoice_number: Optional[str] = None

    invoice_path: Optional[str] = None

    # ==========================================================
    # Remarks
    # ==========================================================

    remarks: Optional[str] = None

    created_by: Optional[str] = None

    is_active: bool = True


# ==========================================================
# Create Fuel Log
# ==========================================================

class FuelCreate(FuelBase):
    pass


# ==========================================================
# Update Fuel Log
# ==========================================================

class FuelUpdate(BaseModel):

    driver_id: Optional[int] = None

    trip_id: Optional[int] = None

    fuel_date: Optional[date] = None

    fuel_type: Optional[str] = None

    liters: Optional[float] = Field(
        None,
        gt=0,
    )

    price_per_liter: Optional[float] = Field(
        None,
        gt=0,
    )

    odometer: Optional[float] = Field(
        None,
        ge=0,
    )

    fuel_station: Optional[str] = None

    station_location: Optional[str] = None

    payment_method: Optional[str] = None

    invoice_number: Optional[str] = None

    invoice_path: Optional[str] = None

    remarks: Optional[str] = None

    created_by: Optional[str] = None

    is_active: Optional[bool] = None


# ==========================================================
# Fuel Response
# ==========================================================

class FuelResponse(FuelBase):

    id: int

    total_cost: float

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# Vehicle Fuel Statistics
# ==========================================================

class FuelStatistics(BaseModel):

    total_logs: int

    total_liters: float

    total_cost: float

    average_price_per_liter: float


# ==========================================================
# API Response
# ==========================================================

class FuelAPIResponse(BaseModel):

    success: bool

    message: str

    data: Optional[dict] = None