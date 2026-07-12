
from fastapi import (
    APIRouter,
    Depends,
    Path,
    Query,
    status,
)
from sqlalchemy.orm import Session #type: ignore

from database.database import get_db
from database.models.user import User

from middleware.auth import (
    require_auth,
    require_role,
)
# ===========================
# Schemas
# ===========================

from schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleStatusUpdate,
    VehicleOdometerUpdate,
)

# ===========================
# Services
# ===========================

from services.vehicle import (
    create_vehicle,
    update_vehicle,
    delete_vehicle,
    get_vehicle,
    get_all_vehicles,
    get_available_vehicles,
    get_vehicle_dropdown,
    vehicle_statistics,
    change_vehicle_status,
    update_vehicle_odometer,
    get_vehicle_location,
)

vehicles_router= APIRouter()


# ==========================================================
# Create Vehicle
# ==========================================================

@vehicles_router.post(
    "/create_new_vehicle",
    status_code=status.HTTP_201_CREATED,
    summary="Create Vehicle",
)
def create_new_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    return create_vehicle(
        db=db,
        payload=payload,
    )

# ==========================================================
# Get All Vehicles
# ==========================================================

@vehicles_router.get(
    "/list_vehicles",
    summary="Get All Vehicles",
)
def list_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    vehicle_type: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    return get_all_vehicles(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        vehicle_type=vehicle_type,
        status=status_filter,
    )

# ==========================================================
# Vehicle Details
# ==========================================================

@vehicles_router.get(
    "/vehicle_details/{vehicle_id}",
    summary="Get Vehicle Details",
)
def vehicle_details(
    vehicle_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    return get_vehicle(
        db=db,
        vehicle_id=vehicle_id,
    )


# ==========================================================
# Update Vehicle
# ==========================================================
@vehicles_router.put(
    "/edit_vehicle/{vehicle_id}",
    summary="Update Vehicle",
)
def edit_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    return update_vehicle(
        db=db,
        vehicle_id=vehicle_id,
        payload=payload,
    )
# ==========================================================
# Delete Vehicle
# ==========================================================
@vehicles_router.delete(
    "/remove_vehicle/{vehicle_id}",
    summary="Delete Vehicle",
)
def remove_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    return delete_vehicle(
        db=db,
        vehicle_id=vehicle_id,
    )

# ==========================================================
# Available Vehicles
# ==========================================================
@vehicles_router.get(
    "/available_vehicles",
    summary="Available Vehicles",
)
def available_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    return get_available_vehicles(
        db=db,
    )

# ==========================================================
# Vehicle Dropdown
# ==========================================================

@vehicles_router.get(
    "/dropdown",
    summary="Vehicle Dropdown",
)
def dropdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    return get_vehicle_dropdown(
        db=db,
    )

# ==========================================================
# Dashboard Statistics
# ==========================================================
@vehicles_router.get(
    "/statistics",
    summary="Vehicle Statistics",
)
def statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):
    return vehicle_statistics(
        db=db,
    )


# ==========================================================
# Update Vehicle Status
# ==========================================================
@vehicles_router.patch(
    "/update_status/{vehicle_id}",
    summary="Update Vehicle Status",
)
def update_status(
    vehicle_id: int,
    payload: VehicleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Admin", "Dispatcher")
    ),
):
    return change_vehicle_status(
        db=db,
        vehicle_id=vehicle_id,
        payload=payload,
    )

# ==========================================================
# Update Odometer
# ==========================================================
@vehicles_router.patch(
    "/update_odometer/{vehicle_id}",
    summary="Update Odometer",
)
def update_odometer(
    vehicle_id: int,
    payload: VehicleOdometerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Admin", "Dispatcher")
    ),
):
    return update_vehicle_odometer(
        db=db,
        vehicle_id=vehicle_id,
        payload=payload,
    )

# ==========================================================
# Vehicle Live Location
# ==========================================================
@vehicles_router.get(
    "/vehicle_location/{vehicle_id}",
    summary="Live Vehicle Location",
)
def vehicle_location(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    return get_vehicle_location(
        db=db,
        vehicle_id=vehicle_id,
    )