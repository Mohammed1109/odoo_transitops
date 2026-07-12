from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session #type: ignore

from database.database import get_db

# ==========================================================
# Schemas
# ==========================================================

from schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceStart,
    MaintenanceComplete,
    MaintenanceCancel,
)

# ==========================================================
# Services
# ==========================================================

from services.maintenance import (
    create_maintenance,
    update_maintenance,
    delete_maintenance,
    get_maintenance,
    get_all_maintenance,
    get_pending_maintenance,
    get_active_maintenance,
    get_completed_maintenance,
    maintenance_statistics,
    start_maintenance,
    complete_maintenance,
    cancel_maintenance,
)

maintenance_router = APIRouter()


# ==========================================================
# Create Maintenance
# ==========================================================

@maintenance_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create Maintenance",
)
def create_new_maintenance(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db),
):
    return create_maintenance(
        db=db,
        payload=payload,
    )


# ==========================================================
# Get All Maintenance
# ==========================================================

@maintenance_router.get(
    "/",
    summary="Get All Maintenance",
)
def list_maintenance(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    service_type: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return get_all_maintenance(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        status=status_filter,
        service_type=service_type,
    )


# ==========================================================
# Pending Maintenance
# ==========================================================

@maintenance_router.get(
    "/pending/list",
    summary="Pending Maintenance",
)
def pending_maintenance(
    db: Session = Depends(get_db),
):
    return get_pending_maintenance(
        db=db,
    )


# ==========================================================
# Active Maintenance
# ==========================================================

@maintenance_router.get(
    "/active/list",
    summary="Active Maintenance",
)
def active_maintenance(
    db: Session = Depends(get_db),
):
    return get_active_maintenance(
        db=db,
    )


# ==========================================================
# Completed Maintenance
# ==========================================================

@maintenance_router.get(
    "/completed/list",
    summary="Completed Maintenance",
)
def completed_maintenance(
    db: Session = Depends(get_db),
):
    return get_completed_maintenance(
        db=db,
    )


# ==========================================================
# Maintenance Details
# ==========================================================

@maintenance_router.get(
    "/{maintenance_id}",
    summary="Maintenance Details",
)
def maintenance_details(
    maintenance_id: int = Path(...),
    db: Session = Depends(get_db),
):
    return get_maintenance(
        db=db,
        maintenance_id=maintenance_id,
    )


# ==========================================================
# Update Maintenance
# ==========================================================

@maintenance_router.put(
    "/{maintenance_id}",
    summary="Update Maintenance",
)
def edit_maintenance(
    maintenance_id: int,
    payload: MaintenanceUpdate,
    db: Session = Depends(get_db),
):
    return update_maintenance(
        db=db,
        maintenance_id=maintenance_id,
        payload=payload,
    )


# ==========================================================
# Delete Maintenance
# ==========================================================

@maintenance_router.delete(
    "/{maintenance_id}",
    summary="Delete Maintenance",
)
def remove_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
):
    return delete_maintenance(
        db=db,
        maintenance_id=maintenance_id,
    )


# ==========================================================
# Start Maintenance
# ==========================================================

@maintenance_router.post(
    "/{maintenance_id}/start",
    summary="Start Maintenance",
)
def start(
    maintenance_id: int,
    payload: MaintenanceStart,
    db: Session = Depends(get_db),
):
    return start_maintenance(
        db=db,
        maintenance_id=maintenance_id,
        payload=payload,
    )


# ==========================================================
# Complete Maintenance
# ==========================================================

@maintenance_router.post(
    "/{maintenance_id}/complete",
    summary="Complete Maintenance",
)
def complete(
    maintenance_id: int,
    payload: MaintenanceComplete,
    db: Session = Depends(get_db),
):
    return complete_maintenance(
        db=db,
        maintenance_id=maintenance_id,
        payload=payload,
    )


# ==========================================================
# Cancel Maintenance
# ==========================================================

@maintenance_router.post(
    "/{maintenance_id}/cancel",
    summary="Cancel Maintenance",
)
def cancel(
    maintenance_id: int,
    payload: MaintenanceCancel,
    db: Session = Depends(get_db),
):
    return cancel_maintenance(
        db=db,
        maintenance_id=maintenance_id,
        payload=payload,
    )


# ==========================================================
# Dashboard Statistics
# ==========================================================

@maintenance_router.get(
    "/statistics/summary",
    summary="Maintenance Statistics",
)
def statistics(
    db: Session = Depends(get_db),
):
    return maintenance_statistics(
        db=db,
    )