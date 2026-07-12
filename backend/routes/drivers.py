from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session #type: ignore

from database.database import get_db

# ==========================================================
# Schemas
# ==========================================================

from schemas.driver import (
    DriverCreate,
    DriverUpdate,
    DriverStatusUpdate,
    DriverSafetyUpdate,
)

# ==========================================================
# Services
# ==========================================================

from services.driver import (
    create_driver,
    update_driver,
    delete_driver,
    get_driver,
    get_all_drivers,
    get_available_drivers,
    get_driver_dropdown,
    driver_statistics,
    change_driver_status,
    update_driver_safety,
    get_driver_location,
)

drivers_router = APIRouter()


# ==========================================================
# Create Driver
# ==========================================================

@drivers_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create Driver",
)
def create_new_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
):
    return create_driver(
        db=db,
        payload=payload,
    )


# ==========================================================
# Get All Drivers
# ==========================================================

@drivers_router.get(
    "/",
    summary="Get All Drivers",
)
def list_drivers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    return get_all_drivers(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        status=status_filter,
    )


# ==========================================================
# Get Driver Details
# ==========================================================

@drivers_router.get(
    "/{driver_id}",
    summary="Get Driver Details",
)
def driver_details(
    driver_id: int = Path(...),
    db: Session = Depends(get_db),
):
    return get_driver(
        db=db,
        driver_id=driver_id,
    )


# ==========================================================
# Update Driver
# ==========================================================

@drivers_router.put(
    "/{driver_id}",
    summary="Update Driver",
)
def edit_driver(
    driver_id: int,
    payload: DriverUpdate,
    db: Session = Depends(get_db),
):
    return update_driver(
        db=db,
        driver_id=driver_id,
        payload=payload,
    )


# ==========================================================
# Delete Driver
# ==========================================================

@drivers_router.delete(
    "/{driver_id}",
    summary="Delete Driver",
)
def remove_driver(
    driver_id: int,
    db: Session = Depends(get_db),
):
    return delete_driver(
        db=db,
        driver_id=driver_id,
    )


# ==========================================================
# Available Drivers
# ==========================================================

@drivers_router.get(
    "/available/list",
    summary="Available Drivers",
)
def available_drivers(
    db: Session = Depends(get_db),
):
    return get_available_drivers(
        db=db,
    )


# ==========================================================
# Driver Dropdown
# ==========================================================

@drivers_router.get(
    "/dropdown/list",
    summary="Driver Dropdown",
)
def dropdown(
    db: Session = Depends(get_db),
):
    return get_driver_dropdown(
        db=db,
    )


# ==========================================================
# Driver Statistics
# ==========================================================

@drivers_router.get(
    "/statistics/summary",
    summary="Driver Statistics",
)
def statistics(
    db: Session = Depends(get_db),
):
    return driver_statistics(
        db=db,
    )


# ==========================================================
# Update Driver Status
# ==========================================================

@drivers_router.patch(
    "/{driver_id}/status",
    summary="Update Driver Status",
)
def update_status(
    driver_id: int,
    payload: DriverStatusUpdate,
    db: Session = Depends(get_db),
):
    return change_driver_status(
        db=db,
        driver_id=driver_id,
        payload=payload,
    )


# ==========================================================
# Update Driver Safety Score
# ==========================================================

@drivers_router.patch(
    "/{driver_id}/safety",
    summary="Update Driver Safety Score",
)
def update_safety(
    driver_id: int,
    payload: DriverSafetyUpdate,
    db: Session = Depends(get_db),
):
    return update_driver_safety(
        db=db,
        driver_id=driver_id,
        payload=payload,
    )


# ==========================================================
# Driver Live Location
# ==========================================================

@drivers_router.get(
    "/{driver_id}/location",
    summary="Driver Live Location",
)
def driver_location(
    driver_id: int,
    db: Session = Depends(get_db),
):
    return get_driver_location(
        db=db,
        driver_id=driver_id,
    )