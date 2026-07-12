from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func #type:ignore
from sqlalchemy.orm import Session #type: ignore


from database.models.fuel_log import FuelLog
from database.models.vehicle import Vehicle
from database.models.driver import Driver
from database.models.trip import Trip

from schemas.fuel import (
    FuelCreate,
    FuelUpdate,
)


# ==========================================================
# Helper Functions
# ==========================================================

def _get_fuel_log_or_404(
    db: Session,
    fuel_id: int,
):

    fuel = (

        db.query(FuelLog)

        .filter(
            FuelLog.id == fuel_id,
            FuelLog.is_active == True,
        )

        .first()

    )

    if fuel is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fuel log not found.",
        )

    return fuel


def _get_vehicle_or_404(
    db: Session,
    vehicle_id: int,
):

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


def _get_driver_or_none(
    db: Session,
    driver_id: int | None,
):

    if driver_id is None:

        return None

    return (

        db.query(Driver)

        .filter(
            Driver.id == driver_id,
            Driver.is_active == True,
        )

        .first()

    )


def _get_trip_or_none(
    db: Session,
    trip_id: int | None,
):

    if trip_id is None:

        return None

    return (

        db.query(Trip)

        .filter(
            Trip.id == trip_id,
            Trip.is_active == True,
        )

        .first()

    )


# ==========================================================
# Create Fuel Log
# ==========================================================

def create_fuel_log(
    db: Session,
    payload: FuelCreate,
):

    # ----------------------------------------------------------
    # Vehicle Validation
    # ----------------------------------------------------------

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=payload.vehicle_id,
    )

    if not vehicle.is_active:

        raise HTTPException(
            status_code=400,
            detail="Vehicle is inactive.",
        )

    # ----------------------------------------------------------
    # Driver Validation
    # ----------------------------------------------------------

    driver = _get_driver_or_none(
        db=db,
        driver_id=payload.driver_id,
    )

    if payload.driver_id and driver is None:

        raise HTTPException(
            status_code=404,
            detail="Driver not found.",
        )

    # ----------------------------------------------------------
    # Trip Validation
    # ----------------------------------------------------------

    trip = _get_trip_or_none(
        db=db,
        trip_id=payload.trip_id,
    )

    if payload.trip_id and trip is None:

        raise HTTPException(
            status_code=404,
            detail="Trip not found.",
        )

    # ----------------------------------------------------------
    # Odometer Validation
    # ----------------------------------------------------------

    if payload.odometer < vehicle.odometer:

        raise HTTPException(
            status_code=400,
            detail=(
                "Fuel log odometer cannot "
                "be less than vehicle odometer."
            ),
        )

    # ----------------------------------------------------------
    # Create Fuel Log
    # ----------------------------------------------------------

    fuel = FuelLog(

        vehicle_id=payload.vehicle_id,

        driver_id=payload.driver_id,

        trip_id=payload.trip_id,

        fuel_date=payload.fuel_date,

        fuel_type=payload.fuel_type,

        liters=payload.liters,

        price_per_liter=payload.price_per_liter,

        odometer=payload.odometer,

        fuel_station=payload.fuel_station,

        station_location=payload.station_location,

        payment_method=payload.payment_method,

        invoice_number=payload.invoice_number,

        invoice_path=payload.invoice_path,

        remarks=payload.remarks,

        created_by=payload.created_by,

        is_active=True,

        created_at=datetime.utcnow(),

        updated_at=datetime.utcnow(),

    )

    # ----------------------------------------------------------
    # Calculate Total Cost
    # ----------------------------------------------------------

    fuel.total_cost = (

        fuel.liters

        * fuel.price_per_liter

    )

    # ----------------------------------------------------------
    # Update Vehicle Odometer
    # ----------------------------------------------------------

    vehicle.odometer = payload.odometer

    vehicle.updated_at = datetime.utcnow()

    # ----------------------------------------------------------
    # Save
    # ----------------------------------------------------------

    db.add(fuel)

    db.commit()

    db.refresh(fuel)

    return {

        "success": True,

        "message": "Fuel log created successfully.",

        "data": {

            "id": fuel.id,

            "vehicle_id": fuel.vehicle_id,

            "total_cost": fuel.total_cost,

        }

    }
    # ==========================================================
# Get Fuel Log
# ==========================================================

def get_fuel_log(
    db: Session,
    fuel_id: int,
):

    fuel = _get_fuel_log_or_404(
        db=db,
        fuel_id=fuel_id,
    )

    return {

        "success": True,

        "data": fuel,

    }


# ==========================================================
# Get All Fuel Logs
# ==========================================================

def get_all_fuel_logs(
    db: Session,
    page: int,
    page_size: int,
    search: str = None,
    vehicle_id: int = None,
    fuel_type: str = None,
):

    query = db.query(FuelLog)

    query = query.filter(
        FuelLog.is_active == True,
    )

    # ----------------------------------------------------------
    # Search
    # ----------------------------------------------------------

    if search:

        query = query.filter(

            (FuelLog.fuel_station.ilike(f"%{search}%"))

            |

            (FuelLog.invoice_number.ilike(f"%{search}%"))

            |

            (FuelLog.remarks.ilike(f"%{search}%"))

        )

    # ----------------------------------------------------------
    # Vehicle Filter
    # ----------------------------------------------------------

    if vehicle_id:

        query = query.filter(
            FuelLog.vehicle_id == vehicle_id,
        )

    # ----------------------------------------------------------
    # Fuel Type Filter
    # ----------------------------------------------------------

    if fuel_type:

        query = query.filter(
            FuelLog.fuel_type == fuel_type,
        )

    total = query.count()

    fuel_logs = (

        query

        .order_by(
            FuelLog.fuel_date.desc(),
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

        "data": fuel_logs,

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
# Vehicle Fuel Logs
# ==========================================================

def get_vehicle_fuel_logs(
    db: Session,
    vehicle_id: int,
):

    _get_vehicle_or_404(
        db=db,
        vehicle_id=vehicle_id,
    )

    logs = (

        db.query(FuelLog)

        .filter(

            FuelLog.vehicle_id == vehicle_id,

            FuelLog.is_active == True,

        )

        .order_by(
            FuelLog.fuel_date.desc(),
        )

        .all()

    )

    return {

        "success": True,

        "data": logs,

    }
# ==========================================================
# Update Fuel Log
# ==========================================================

def update_fuel_log(
    db: Session,
    fuel_id: int,
    payload: FuelUpdate,
):

    fuel = _get_fuel_log_or_404(
        db=db,
        fuel_id=fuel_id,
    )

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=fuel.vehicle_id,
    )

    # ----------------------------------------------------------
    # Validate Driver
    # ----------------------------------------------------------

    if payload.driver_id is not None:

        driver = _get_driver_or_none(
            db=db,
            driver_id=payload.driver_id,
        )

        if driver is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found.",
            )

    # ----------------------------------------------------------
    # Validate Trip
    # ----------------------------------------------------------

    if payload.trip_id is not None:

        trip = _get_trip_or_none(
            db=db,
            trip_id=payload.trip_id,
        )

        if trip is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trip not found.",
            )

    # ----------------------------------------------------------
    # Update Fields
    # ----------------------------------------------------------

    update_data = payload.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():

        setattr(
            fuel,
            field,
            value,
        )

    # ----------------------------------------------------------
    # Odometer Validation
    # ----------------------------------------------------------

    if fuel.odometer < vehicle.odometer:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Fuel log odometer cannot "
                "be less than vehicle odometer."
            ),
        )

    # ----------------------------------------------------------
    # Calculate Total Cost
    # ----------------------------------------------------------

    fuel.total_cost = (

        fuel.liters

        * fuel.price_per_liter

    )

    # ----------------------------------------------------------
    # Update Vehicle Odometer
    # ----------------------------------------------------------

    vehicle.odometer = fuel.odometer

    vehicle.updated_at = datetime.utcnow()

    fuel.updated_at = datetime.utcnow()

    # ----------------------------------------------------------
    # Commit
    # ----------------------------------------------------------

    try:

        db.commit()

        db.refresh(fuel)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update fuel log.",
        )

    return {

        "success": True,

        "message": "Fuel log updated successfully.",

        "data": fuel,

    }


# ==========================================================
# Delete Fuel Log
# ==========================================================

def delete_fuel_log(
    db: Session,
    fuel_id: int,
):

    fuel = _get_fuel_log_or_404(
        db=db,
        fuel_id=fuel_id,
    )

    fuel.is_active = False

    fuel.updated_at = datetime.utcnow()

    try:

        db.commit()

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete fuel log.",
        )

    return {

        "success": True,

        "message": "Fuel log deleted successfully.",

    }
# ==========================================================
# Fuel Statistics
# ==========================================================

def fuel_statistics(
    db: Session,
):

    total_logs = (

        db.query(FuelLog)

        .filter(
            FuelLog.is_active == True,
        )

        .count()

    )

    total_liters = (

        db.query(
            func.coalesce(
                func.sum(FuelLog.liters),
                0,
            )
        )

        .filter(
            FuelLog.is_active == True,
        )

        .scalar()

    )

    total_cost = (

        db.query(
            func.coalesce(
                func.sum(FuelLog.total_cost),
                0,
            )
        )

        .filter(
            FuelLog.is_active == True,
        )

        .scalar()

    )

    average_price = (

        db.query(
            func.coalesce(
                func.avg(FuelLog.price_per_liter),
                0,
            )
        )

        .filter(
            FuelLog.is_active == True,
        )

        .scalar()

    )

    return {

        "success": True,

        "data": {

            "total_logs": total_logs,

            "total_liters": round(
                float(total_liters),
                2,
            ),

            "total_cost": round(
                float(total_cost),
                2,
            ),

            "average_price_per_liter": round(
                float(average_price),
                2,
            ),

        }

    }