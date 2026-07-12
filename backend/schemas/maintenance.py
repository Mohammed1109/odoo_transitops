from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# Base Schema
# ==========================================================

class MaintenanceBase(BaseModel):

    # ==========================================================
    # Vehicle
    # ==========================================================

    vehicle_id: int

    # ==========================================================
    # Service Information
    # ==========================================================

    service_type: str

    description: Optional[str] = None

    service_center: Optional[str] = None

    vendor_name: Optional[str] = None

    vendor_contact: Optional[str] = None

    invoice_number: Optional[str] = None

    invoice_path: Optional[str] = None

    # ==========================================================
    # Vehicle Reading
    # ==========================================================

    current_odometer: float = Field(
        0,
        ge=0,
    )

    next_service_odometer: float = Field(
        0,
        ge=0,
    )

    # ==========================================================
    # Cost
    # ==========================================================

    labour_cost: float = Field(
        0,
        ge=0,
    )

    parts_cost: float = Field(
        0,
        ge=0,
    )

    other_cost: float = Field(
        0,
        ge=0,
    )

    

    # ==========================================================
    # Dates
    # ==========================================================

    service_date: date

    expected_completion_date: Optional[date] = None

    completion_date: Optional[date] = None

    # ==========================================================
    # Priority
    # ==========================================================

    priority: str = "Normal"

    # ==========================================================
    # Status
    # ==========================================================

    status: str = "Pending"

    # ==========================================================
    # Remarks
    # ==========================================================

    remarks: Optional[str] = None

    created_by: Optional[str] = None

    is_active: bool = True


# ==========================================================
# Create Maintenance
# ==========================================================

class MaintenanceCreate(MaintenanceBase):
    pass


# ==========================================================
# Update Maintenance
# ==========================================================

class MaintenanceUpdate(BaseModel):

    service_type: Optional[str] = None

    description: Optional[str] = None

    service_center: Optional[str] = None

    vendor_name: Optional[str] = None

    vendor_contact: Optional[str] = None

    invoice_number: Optional[str] = None

    invoice_path: Optional[str] = None

    current_odometer: Optional[float] = Field(
        None,
        ge=0,
    )

    next_service_odometer: Optional[float] = Field(
        None,
        ge=0,
    )

    labour_cost: Optional[float] = Field(
        None,
        ge=0,
    )

    parts_cost: Optional[float] = Field(
        None,
        ge=0,
    )

    other_cost: Optional[float] = Field(
        None,
        ge=0,
    )

    

    service_date: Optional[date] = None

    expected_completion_date: Optional[date] = None

    completion_date: Optional[date] = None

    priority: Optional[str] = None

    status: Optional[str] = None

    remarks: Optional[str] = None

    created_by: Optional[str] = None

    is_active: Optional[bool] = None


# ==========================================================
# Start Maintenance
# ==========================================================

class MaintenanceStart(BaseModel):

    remarks: Optional[str] = None


# ==========================================================
# Complete Maintenance
# ==========================================================

class MaintenanceComplete(BaseModel):

    completion_date: date

    service_completed_odometer: float = Field(
    ...,
    ge=0,
)

    next_service_odometer: float = Field(
        ...,
        ge=0,
    )

    labour_cost: float = Field(
        0,
        ge=0,
    )

    parts_cost: float = Field(
        0,
        ge=0,
    )

    other_cost: float = Field(
        0,
        ge=0,
    )

    remarks: Optional[str] = None


# ==========================================================
# Cancel Maintenance
# ==========================================================

class MaintenanceCancel(BaseModel):

    remarks: str


# ==========================================================
# Response
# ==========================================================

class MaintenanceResponse(MaintenanceBase):

    id: int

    maintenance_number: str
    total_cost: float

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# Dropdown
# ==========================================================

class MaintenanceDropdown(BaseModel):

    id: int

    maintenance_number: str

    service_type: str

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# Statistics
# ==========================================================

class MaintenanceStatistics(BaseModel):

    total: int

    pending: int

    in_progress: int

    completed: int

    cancelled: int

    total_cost: float


# ==========================================================
# API Response
# ==========================================================

class MaintenanceAPIResponse(BaseModel):

    success: bool

    message: str

    data: Optional[dict] = None