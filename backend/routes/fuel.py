from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session #type:ignore

from database.database import get_db

# ==========================================================
# Schemas
# ==========================================================

from schemas.fuel import (
    FuelCreate,
    FuelUpdate,
)

# ==========================================================
# Services
# ==========================================================

from services.fuel import (
    create_fuel_log,
    update_fuel_log,
    delete_fuel_log,
    get_fuel_log,
    get_all_fuel_logs,
    get_vehicle_fuel_logs,
    fuel_statistics,
)

fuel_router = APIRouter()


# ==========================================================
# Create Fuel Log
# ==========================================================

@fuel_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create Fuel Log",
)
def create_new_fuel_log(
    payload: FuelCreate,
    db: Session = Depends(get_db),
):
    return create_fuel_log(
        db=db,
        payload=payload,
    )


# ==========================================================
# Get All Fuel Logs
# ==========================================================

@fuel_router.get(
    "/",
    summary="Get All Fuel Logs",
)
def list_fuel_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    vehicle_id: int | None = Query(None),
    fuel_type: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return get_all_fuel_logs(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        vehicle_id=vehicle_id,
        fuel_type=fuel_type,
    )


# ==========================================================
# Fuel Log Details
# ==========================================================

@fuel_router.get(
    "/{fuel_id}",
    summary="Fuel Log Details",
)
def fuel_details(
    fuel_id: int = Path(...),
    db: Session = Depends(get_db),
):
    return get_fuel_log(
        db=db,
        fuel_id=fuel_id,
    )


# ==========================================================
# Update Fuel Log
# ==========================================================

@fuel_router.put(
    "/{fuel_id}",
    summary="Update Fuel Log",
)
def edit_fuel_log(
    fuel_id: int,
    payload: FuelUpdate,
    db: Session = Depends(get_db),
):
    return update_fuel_log(
        db=db,
        fuel_id=fuel_id,
        payload=payload,
    )


# ==========================================================
# Delete Fuel Log
# ==========================================================

@fuel_router.delete(
    "/{fuel_id}",
    summary="Delete Fuel Log",
)
def remove_fuel_log(
    fuel_id: int,
    db: Session = Depends(get_db),
):
    return delete_fuel_log(
        db=db,
        fuel_id=fuel_id,
    )


# ==========================================================
# Vehicle Fuel Logs
# ==========================================================

@fuel_router.get(
    "/vehicle/{vehicle_id}",
    summary="Vehicle Fuel Logs",
)
def vehicle_fuel_logs(
    vehicle_id: int,
    db: Session = Depends(get_db),
):
    return get_vehicle_fuel_logs(
        db=db,
        vehicle_id=vehicle_id,
    )


# ==========================================================
# Dashboard Statistics
# ==========================================================

@fuel_router.get(
    "/statistics/summary",
    summary="Fuel Statistics",
)
def statistics(
    db: Session = Depends(get_db),
):
    return fuel_statistics(
        db=db,
    )