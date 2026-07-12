from datetime import datetime
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func#type: ignore
from sqlalchemy.orm import Session#type: ignore

from constants.status import (
    VehicleStatus,
    MaintenanceStatus,
)

from database.models.vehicle import Vehicle
from database.models.maintenance import Maintenance

from schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceStart,
    MaintenanceComplete,
    MaintenanceCancel,
)

# ==========================================================
# Constants
# ==========================================================

DEFAULT_NEXT_SERVICE_INTERVAL = 10000


# ==========================================================
# Helper Functions
# ==========================================================

def _generate_maintenance_number() -> str:
    """
    Generate unique maintenance number.
    Example:
    MNT-8A4D9C21
    """

    return f"MNT-{uuid.uuid4().hex[:8].upper()}"


def _get_maintenance_or_404(
    db: Session,
    maintenance_id: int,
) -> Maintenance:

    maintenance = (
        db.query(Maintenance)
        .filter(
            Maintenance.id == maintenance_id,
            Maintenance.is_active == True,
        )
        .first()
    )

    if maintenance is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance record not found.",
        )

    return maintenance


def _get_vehicle_or_404(
    db: Session,
    vehicle_id: int,
) -> Vehicle:

    vehicle = (
        db.query(Vehicle)
        .filter(
            Vehicle.id == vehicle_id,
            Vehicle.is_active == True,
        )
        .first()
    )

    if vehicle is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found.",
        )

    return vehicle


# ==========================================================
# Create Maintenance
# ==========================================================

def create_maintenance(
    db: Session,
    payload: MaintenanceCreate,
):

    # ==========================================================
    # Vehicle Validation
    # ==========================================================

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=payload.vehicle_id,
    )

    if vehicle.status != VehicleStatus.AVAILABLE:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only available vehicles can be sent for maintenance.",
        )

    # ==========================================================
    # Check Existing Active Maintenance
    # ==========================================================

    existing = (
        db.query(Maintenance)
        .filter(
            Maintenance.vehicle_id == vehicle.id,
            Maintenance.status.in_(
                [
                    MaintenanceStatus.PENDING,
                    MaintenanceStatus.IN_PROGRESS,
                ]
            ),
            Maintenance.is_active == True,
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle already has an active maintenance record.",
        )

    # ==========================================================
    # Create Maintenance
    # ==========================================================

    maintenance = Maintenance(

        maintenance_number=_generate_maintenance_number(),

        vehicle_id=payload.vehicle_id,

        service_type=payload.service_type,

        description=payload.description,

        service_center=payload.service_center,

        vendor_name=payload.vendor_name,

        vendor_contact=payload.vendor_contact,

        invoice_number=payload.invoice_number,

        invoice_path=payload.invoice_path,

        current_odometer=vehicle.odometer,

        next_service_odometer=(
            vehicle.odometer +
            DEFAULT_NEXT_SERVICE_INTERVAL
        ),

        labour_cost=payload.labour_cost,

        parts_cost=payload.parts_cost,

        other_cost=payload.other_cost,

        service_date=payload.service_date,

        expected_completion_date=payload.expected_completion_date,

        completion_date=None,

        priority=payload.priority,

        status=MaintenanceStatus.PENDING,

        remarks=payload.remarks,

        created_by=payload.created_by,

        is_active=True,

        created_at=datetime.utcnow(),

        updated_at=datetime.utcnow(),
    )

    # ==========================================================
    # Calculate Total Cost
    # ==========================================================

    maintenance.total_cost = (

        maintenance.labour_cost

        + maintenance.parts_cost

        + maintenance.other_cost

    )

    db.add(maintenance)

    db.commit()

    db.refresh(maintenance)

    return {

        "success": True,

        "message": "Maintenance created successfully.",

        "data": {

            "id": maintenance.id,

            "maintenance_number": maintenance.maintenance_number,

            "status": maintenance.status,

        }

    }
# ==========================================================
# Get Maintenance Details
# ==========================================================

def get_maintenance(
    db: Session,
    maintenance_id: int,
):

    maintenance = _get_maintenance_or_404(
        db=db,
        maintenance_id=maintenance_id,
    )

    return {

        "success": True,

        "data": maintenance,

    }


# ==========================================================
# Get All Maintenance
# ==========================================================

def get_all_maintenance(
    db: Session,
    page: int,
    page_size: int,
    search: str = None,
    status: str = None,
    service_type: str = None,
):

    query = db.query(Maintenance)

    query = query.filter(
        Maintenance.is_active == True,
    )

    # ----------------------------------------------------------
    # Search
    # ----------------------------------------------------------

    if search:

        query = query.filter(

            (Maintenance.maintenance_number.ilike(f"%{search}%"))

            |

            (Maintenance.vendor_name.ilike(f"%{search}%"))

            |

            (Maintenance.service_center.ilike(f"%{search}%"))

            |

            (Maintenance.service_type.ilike(f"%{search}%"))

        )

    # ----------------------------------------------------------
    # Status Filter
    # ----------------------------------------------------------

    if status:

        query = query.filter(
            Maintenance.status == status,
        )

    # ----------------------------------------------------------
    # Service Type
    # ----------------------------------------------------------

    if service_type:

        query = query.filter(
            Maintenance.service_type == service_type,
        )

    total = query.count()

    maintenances = (

        query

        .order_by(
            Maintenance.created_at.desc(),
        )

        .offset(
            (page - 1) * page_size,
        )

        .limit(
            page_size,
        )

        .all()

    )

    return {

        "success": True,

        "data": maintenances,

        "pagination": {

            "page": page,

            "page_size": page_size,

            "total_records": total,

            "total_pages": (

                total + page_size - 1

            ) // page_size,

        }

    }


# ==========================================================
# Pending Maintenance
# ==========================================================

def get_pending_maintenance(
    db: Session,
):

    data = (

        db.query(Maintenance)

        .filter(

            Maintenance.status == MaintenanceStatus.PENDING,

            Maintenance.is_active == True,

        )

        .order_by(
            Maintenance.service_date.asc(),
        )

        .all()

    )

    return {

        "success": True,

        "data": data,

    }


# ==========================================================
# Active Maintenance
# ==========================================================

def get_active_maintenance(
    db: Session,
):

    data = (

        db.query(Maintenance)

        .filter(

            Maintenance.status == MaintenanceStatus.IN_PROGRESS,

            Maintenance.is_active == True,

        )

        .order_by(
            Maintenance.service_date.asc(),
        )

        .all()

    )

    return {

        "success": True,

        "data": data,

    }


# ==========================================================
# Completed Maintenance
# ==========================================================

def get_completed_maintenance(
    db: Session,
):

    data = (

        db.query(Maintenance)

        .filter(

            Maintenance.status == MaintenanceStatus.COMPLETED,

            Maintenance.is_active == True,

        )

        .order_by(
            Maintenance.completion_date.desc(),
        )

        .all()

    )

    return {

        "success": True,

        "data": data,

    }
# ==========================================================
# Update Maintenance
# ==========================================================

def update_maintenance(
    db: Session,
    maintenance_id: int,
    payload: MaintenanceUpdate,
):

    maintenance = _get_maintenance_or_404(
        db=db,
        maintenance_id=maintenance_id,
    )

    # ----------------------------------------------------------
    # Only Pending Maintenance Can Be Updated
    # ----------------------------------------------------------

    if maintenance.status != MaintenanceStatus.PENDING:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending maintenance can be updated.",
        )

    # ----------------------------------------------------------
    # Update Fields
    # ----------------------------------------------------------

    update_data = payload.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():

        setattr(
            maintenance,
            field,
            value,
        )

    # ----------------------------------------------------------
    # Recalculate Total Cost
    # ----------------------------------------------------------

    maintenance.total_cost = (

        maintenance.labour_cost

        + maintenance.parts_cost

        + maintenance.other_cost

    )

    maintenance.updated_at = datetime.utcnow()

    try:

        db.commit()

        db.refresh(maintenance)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update maintenance.",
        )

    return {

        "success": True,

        "message": "Maintenance updated successfully.",

        "data": maintenance,

    }


# ==========================================================
# Delete Maintenance
# ==========================================================

def delete_maintenance(
    db: Session,
    maintenance_id: int,
):

    maintenance = _get_maintenance_or_404(
        db=db,
        maintenance_id=maintenance_id,
    )

    # ----------------------------------------------------------
    # Only Pending Maintenance Can Be Deleted
    # ----------------------------------------------------------

    if maintenance.status != MaintenanceStatus.PENDING:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending maintenance can be deleted.",
        )

    maintenance.is_active = False

    maintenance.updated_at = datetime.utcnow()

    try:

        db.commit()

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete maintenance.",
        )

    return {

        "success": True,

        "message": "Maintenance deleted successfully.",

    }
# ==========================================================
# Start Maintenance
# ==========================================================

def start_maintenance(
    db: Session,
    maintenance_id: int,
    payload: MaintenanceStart,
):

    # ----------------------------------------------------------
    # Get Maintenance
    # ----------------------------------------------------------

    maintenance = _get_maintenance_or_404(
        db=db,
        maintenance_id=maintenance_id,
    )

    # ----------------------------------------------------------
    # Only Pending Maintenance Can Start
    # ----------------------------------------------------------

    if maintenance.status != MaintenanceStatus.PENDING:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending maintenance can be started.",
        )

    # ----------------------------------------------------------
    # Get Vehicle
    # ----------------------------------------------------------

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=maintenance.vehicle_id,
    )

    # ----------------------------------------------------------
    # Vehicle Validation
    # ----------------------------------------------------------

    if vehicle.status != VehicleStatus.AVAILABLE:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle is not available for maintenance.",
        )

    # ----------------------------------------------------------
    # Update Maintenance
    # ----------------------------------------------------------

    maintenance.status = MaintenanceStatus.IN_PROGRESS

    maintenance.remarks = payload.remarks

    maintenance.updated_at = datetime.utcnow()

    # ----------------------------------------------------------
    # Update Vehicle
    # ----------------------------------------------------------

    vehicle.status = VehicleStatus.IN_SHOP

    vehicle.updated_at = datetime.utcnow()

    # ----------------------------------------------------------
    # Commit
    # ----------------------------------------------------------

    try:

        db.commit()

        db.refresh(maintenance)

        db.refresh(vehicle)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to start maintenance.",
        )

    return {

        "success": True,

        "message": "Maintenance started successfully.",

        "data": {

            "maintenance_id": maintenance.id,

            "maintenance_number": maintenance.maintenance_number,

            "status": maintenance.status,

            "vehicle_status": vehicle.status,

        }

    }


# ==========================================================
# Complete Maintenance
# ==========================================================

def complete_maintenance(
    db: Session,
    maintenance_id: int,
    payload: MaintenanceComplete,
):

    # ----------------------------------------------------------
    # Get Maintenance
    # ----------------------------------------------------------

    maintenance = _get_maintenance_or_404(
        db=db,
        maintenance_id=maintenance_id,
    )

    # ----------------------------------------------------------
    # Only In Progress Can Complete
    # ----------------------------------------------------------

    if maintenance.status != MaintenanceStatus.IN_PROGRESS:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only maintenance in progress can be completed.",
        )

    # ----------------------------------------------------------
    # Get Vehicle
    # ----------------------------------------------------------

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=maintenance.vehicle_id,
    )

    # ----------------------------------------------------------
    # Update Maintenance
    # ----------------------------------------------------------

    maintenance.status = MaintenanceStatus.COMPLETED

    maintenance.completion_date = payload.completion_date

    maintenance.service_completed_odometer = (
    payload.service_completed_odometer
)
    maintenance.next_service_odometer = (
    payload.next_service_odometer
)

    maintenance.labour_cost = payload.labour_cost

    maintenance.parts_cost = payload.parts_cost

    maintenance.other_cost = payload.other_cost

    maintenance.total_cost = (

        payload.labour_cost

        + payload.parts_cost

        + payload.other_cost

    )

    maintenance.remarks = payload.remarks

    maintenance.updated_at = datetime.utcnow()

    # ----------------------------------------------------------
    # Update Vehicle
    # ----------------------------------------------------------

    vehicle.status = VehicleStatus.AVAILABLE

    vehicle.odometer = (
        payload.service_completed_odometer
    )

    vehicle.updated_at = datetime.utcnow()

    # ----------------------------------------------------------
    # Commit
    # ----------------------------------------------------------

    try:

        db.commit()

        db.refresh(maintenance)

        db.refresh(vehicle)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to complete maintenance.",
        )

    return {

        "success": True,

        "message": "Maintenance completed successfully.",

        "data": {

            "maintenance_id": maintenance.id,

            "maintenance_number": maintenance.maintenance_number,

            "status": maintenance.status,

            "vehicle_status": vehicle.status,

            "vehicle_odometer": vehicle.odometer,

            "next_service_odometer": maintenance.next_service_odometer,

            "total_cost": maintenance.total_cost,

        }

    }
# ==========================================================
# Cancel Maintenance
# ==========================================================

def cancel_maintenance(
    db: Session,
    maintenance_id: int,
    payload: MaintenanceCancel,
):

    # ----------------------------------------------------------
    # Get Maintenance
    # ----------------------------------------------------------

    maintenance = _get_maintenance_or_404(
        db=db,
        maintenance_id=maintenance_id,
    )

    # ----------------------------------------------------------
    # Cannot Cancel Completed Maintenance
    # ----------------------------------------------------------

    if maintenance.status == MaintenanceStatus.COMPLETED:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed maintenance cannot be cancelled.",
        )

    # ----------------------------------------------------------
    # Get Vehicle
    # ----------------------------------------------------------

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=maintenance.vehicle_id,
    )

    # ----------------------------------------------------------
    # Update Maintenance
    # ----------------------------------------------------------

    maintenance.status = MaintenanceStatus.CANCELLED

    maintenance.remarks = payload.remarks

    maintenance.updated_at = datetime.utcnow()

    # ----------------------------------------------------------
    # Restore Vehicle
    # ----------------------------------------------------------

    if vehicle.status == VehicleStatus.IN_SHOP:

        vehicle.status = VehicleStatus.AVAILABLE

        vehicle.updated_at = datetime.utcnow()

    # ----------------------------------------------------------
    # Commit
    # ----------------------------------------------------------

    try:

        db.commit()

        db.refresh(maintenance)

        db.refresh(vehicle)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to cancel maintenance.",
        )

    return {

        "success": True,

        "message": "Maintenance cancelled successfully.",

        "data": {

            "maintenance_id": maintenance.id,

            "maintenance_number": maintenance.maintenance_number,

            "status": maintenance.status,

            "vehicle_status": vehicle.status,

        }

    }


# ==========================================================
# Maintenance Dashboard Statistics
# ==========================================================

def maintenance_statistics(
    db: Session,
):

    total = db.query(Maintenance).filter(
        Maintenance.is_active == True,
    ).count()

    pending = db.query(Maintenance).filter(
        Maintenance.status == MaintenanceStatus.PENDING,
        Maintenance.is_active == True,
    ).count()

    in_progress = db.query(Maintenance).filter(
        Maintenance.status == MaintenanceStatus.IN_PROGRESS,
        Maintenance.is_active == True,
    ).count()

    completed = db.query(Maintenance).filter(
        Maintenance.status == MaintenanceStatus.COMPLETED,
        Maintenance.is_active == True,
    ).count()

    cancelled = db.query(Maintenance).filter(
        Maintenance.status == MaintenanceStatus.CANCELLED,
        Maintenance.is_active == True,
    ).count()

    total_cost = (

        db.query(
            func.coalesce(
                func.sum(Maintenance.total_cost),
                0,
            )
        )

        .filter(
            Maintenance.status == MaintenanceStatus.COMPLETED,
            Maintenance.is_active == True,
        )

        .scalar()

    )

    return {

        "success": True,

        "data": {

            "total": total,

            "pending": pending,

            "in_progress": in_progress,

            "completed": completed,

            "cancelled": cancelled,

            "total_cost": float(total_cost),

        }

    }