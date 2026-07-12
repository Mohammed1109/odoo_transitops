from datetime import datetime

from fastapi import HTTPException, status
from constants.status import VehicleStatus
from sqlalchemy import func, or_ #type:ignore
from sqlalchemy.orm import Session #type: ignore

from database.models.vehicle import Vehicle

from schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleStatusUpdate,
    VehicleOdometerUpdate,
)


# ==========================================================
# Helper Functions
# ==========================================================

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


def _check_registration_exists(
    db: Session,
    registration_number: str,
    exclude_vehicle_id: int | None = None,
):

    query = db.query(Vehicle).filter(
        Vehicle.registration_number == registration_number
    )

    if exclude_vehicle_id is not None:
        query = query.filter(Vehicle.id != exclude_vehicle_id)

    if query.first():
        raise HTTPException(
            status_code=400,
            detail="Registration number already exists.",
        )


# ==========================================================
# Create Vehicle
# ==========================================================

def create_vehicle(
    db: Session,
    payload: VehicleCreate,
):

    _check_registration_exists(
        db=db,
        registration_number=payload.registration_number,
    )

    vehicle = Vehicle(

        registration_number=payload.registration_number,

        vehicle_name=payload.vehicle_name,

        vehicle_model=payload.vehicle_model,

        manufacturer=payload.manufacturer,

        vehicle_type=payload.vehicle_type,

        maximum_load_capacity=payload.maximum_load_capacity,

        capacity_unit=payload.capacity_unit,

        odometer=payload.odometer,

        acquisition_cost=payload.acquisition_cost,

        purchase_date=payload.purchase_date,

        color=payload.color,

        chassis_number=payload.chassis_number,

        engine_number=payload.engine_number,

        vin_number=payload.vin_number,

        fuel_type=payload.fuel_type,

        fuel_tank_capacity=payload.fuel_tank_capacity,

        gps_tracker_id=payload.gps_tracker_id,

        current_latitude=payload.current_latitude,

        current_longitude=payload.current_longitude,

        insurance_number=payload.insurance_number,

        insurance_expiry=payload.insurance_expiry,

        registration_expiry=payload.registration_expiry,

        permit_expiry=payload.permit_expiry,

        status=payload.status,

        is_active=payload.is_active,

        created_at=datetime.utcnow(),

        updated_at=datetime.utcnow(),
    )

    db.add(vehicle)

    db.commit()

    db.refresh(vehicle)

    return {
        "success": True,
        "message": "Vehicle created successfully.",
        "data": vehicle,
    }


# ==========================================================
# Get Vehicle Details
# ==========================================================

def get_vehicle(
    db: Session,
    vehicle_id: int,
):

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=vehicle_id,
    )

    return {
        "success": True,
        "data": vehicle,
    }
# ==========================================================
# Get All Vehicles
# ==========================================================

def get_all_vehicles(
    db: Session,
    vehicle_type: str | None = None,
    status: str | None = None,
):

    query = db.query(Vehicle).filter(
        Vehicle.is_active == True
    )

    # ---------------------------------------
    # Vehicle Type Filter
    # ---------------------------------------

    if vehicle_type:

        query = query.filter(
            Vehicle.vehicle_type == vehicle_type
        )

    # ---------------------------------------
    # Status Filter
    # ---------------------------------------

    if status:

        query = query.filter(
            Vehicle.status == status
        )

    # ---------------------------------------
    # Total Count
    # ---------------------------------------

    total = query.count()

    # ---------------------------------------
    # Pagination
    # ---------------------------------------

    vehicles = (
        query.order_by(Vehicle.id.desc())
        .all()
    )

    return {

        "success": True,

        "total_records": total,

        "data": vehicles,
    }


# ==========================================================
# Update Vehicle
# ==========================================================

def update_vehicle(
    db: Session,
    vehicle_id: int,
    payload: VehicleUpdate,
):

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=vehicle_id,
    )

    # ---------------------------------------
    # Registration Number Validation
    # ---------------------------------------

    if payload.registration_number:

        _check_registration_exists(
            db=db,
            registration_number=payload.registration_number,
            exclude_vehicle_id=vehicle.id,
        )

    # ---------------------------------------
    # Update only supplied fields
    # ---------------------------------------

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            vehicle,
            key,
            value,
        )

    vehicle.updated_at = datetime.utcnow()

    db.commit()

    db.refresh(vehicle)

    return {

        "success": True,

        "message": "Vehicle updated successfully.",

        "data": vehicle,
    }


# ==========================================================
# Delete Vehicle
# ==========================================================

def delete_vehicle(
    db: Session,
    vehicle_id: int,
):

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=vehicle_id,
    )

    # ---------------------------------------
    # Soft Delete
    # ---------------------------------------

    vehicle.is_active = False

    vehicle.updated_at = datetime.utcnow()

    db.commit()

    return {

        "success": True,

        "message": "Vehicle deleted successfully.",
    }
# ==========================================================
# Get Available Vehicles
# ==========================================================

def get_available_vehicles(
    db: Session,
):

    vehicles = (
        db.query(Vehicle)
        .filter(
            Vehicle.is_active == True,
            Vehicle.status == "Available",
        )
        .order_by(Vehicle.vehicle_name.asc())
        .all()
    )

    return {

        "success": True,

        "total": len(vehicles),

        "data": vehicles,
    }


# ==========================================================
# Vehicle Dropdown
# ==========================================================

def get_vehicle_dropdown(
    db: Session,
):

    vehicles = (
        db.query(Vehicle)
        .filter(
            Vehicle.is_active == True,
            Vehicle.status == "Available",
        )
        .order_by(Vehicle.vehicle_name.asc())
        .all()
    )

    dropdown = []

    for vehicle in vehicles:

        dropdown.append({

            "id": vehicle.id,

            "vehicle_name": vehicle.vehicle_name,

            "registration_number": vehicle.registration_number,

        })

    return {

        "success": True,

        "data": dropdown,
    }


# ==========================================================
# Vehicle Statistics
# ==========================================================

def vehicle_statistics(
    db: Session,
):

    total = (
        db.query(func.count(Vehicle.id))
        .filter(
            Vehicle.is_active == True,
        )
        .scalar()
    )

    available = (
        db.query(func.count(Vehicle.id))
        .filter(
            Vehicle.is_active == True,
            Vehicle.status == "Available",
        )
        .scalar()
    )

    on_trip = (
        db.query(func.count(Vehicle.id))
        .filter(
            Vehicle.is_active == True,
            Vehicle.status == "On Trip",
        )
        .scalar()
    )

    in_shop = (
        db.query(func.count(Vehicle.id))
        .filter(
            Vehicle.is_active == True,
            Vehicle.status == "In Shop",
        )
        .scalar()
    )

    retired = (
        db.query(func.count(Vehicle.id))
        .filter(
            Vehicle.is_active == True,
            Vehicle.status == "Retired",
        )
        .scalar()
    )

    return {

        "success": True,

        "data": {

            "total": total,

            "available": available,

            "on_trip": on_trip,

            "in_shop": in_shop,

            "retired": retired,

        },
    }
# ==========================================================
# Change Vehicle Status
# ==========================================================

def change_vehicle_status(
    db: Session,
    vehicle_id: int,
    payload: VehicleStatusUpdate,
):

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=vehicle_id,
    )

    valid_status = [
        VehicleStatus.AVAILABLE,
        VehicleStatus.ON_TRIP,
        VehicleStatus.IN_SHOP,
        VehicleStatus.RETIRED,
    ]

    if payload.status not in valid_status:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid vehicle status. Allowed values: {', '.join(valid_status)}",
        )

    vehicle.status = payload.status

    vehicle.updated_at = datetime.utcnow()

    db.commit()

    db.refresh(vehicle)

    return {

        "success": True,

        "message": "Vehicle status updated successfully.",

        "data": vehicle,
    }


# ==========================================================
# Update Vehicle Odometer
# ==========================================================

def update_vehicle_odometer(
    db: Session,
    vehicle_id: int,
    payload: VehicleOdometerUpdate,
):

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=vehicle_id,
    )

    if payload.odometer < vehicle.odometer:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Odometer cannot be less than the current value.",
        )

    vehicle.odometer = payload.odometer

    vehicle.updated_at = datetime.utcnow()

    db.commit()

    db.refresh(vehicle)

    return {

        "success": True,

        "message": "Vehicle odometer updated successfully.",

        "data": vehicle,
    }


# ==========================================================
# Get Vehicle Live Location
# ==========================================================

def get_vehicle_location(
    db: Session,
    vehicle_id: int,
):

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=vehicle_id,
    )

    return {

        "success": True,

        "data": {

            "vehicle_id": vehicle.id,

            "vehicle_name": vehicle.vehicle_name,

            "registration_number": vehicle.registration_number,

            "latitude": vehicle.current_latitude,

            "longitude": vehicle.current_longitude,

            "status": vehicle.status,

            "last_updated": vehicle.updated_at,

        },
    }