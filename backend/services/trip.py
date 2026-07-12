from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database.models.trip import Trip
from database.models.vehicle import Vehicle
from database.models.driver import Driver
from constants.status import (
    VehicleStatus,
    DriverStatus,
    TripStatus,
)

from schemas.trip import (
    TripCreate,
    TripUpdate,
    TripDispatch,
    TripComplete,
    TripCancel,
)
AVERAGE_SPEED_KMH = 40

# ==========================================================
# Get Trip
# ==========================================================

def _get_trip_or_404(
    db: Session,
    trip_id: int,
) -> Trip:

    trip = (
        db.query(Trip)
        .filter(
            Trip.id == trip_id,
            Trip.is_active == True,
        )
        .first()
    )

    if trip is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found.",
        )

    return trip


# ==========================================================
# Get Vehicle
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
            status_code=404,
            detail="Vehicle not found.",
        )

    return vehicle


# ==========================================================
# Get Driver
# ==========================================================

def _get_driver_or_404(
    db: Session,
    driver_id: int,
) -> Driver:

    driver = (
        db.query(Driver)
        .filter(
            Driver.id == driver_id,
            Driver.is_active == True,
        )
        .first()
    )

    if driver is None:

        raise HTTPException(
            status_code=404,
            detail="Driver not found.",
        )

    return driver
# ==========================================================
# Generate Trip Number
# ==========================================================

# ==========================================================
# Generate Trip Number
# ==========================================================

def _generate_trip_number(
    db: Session,
):

    last_trip = (
        db.query(Trip)
        .order_by(Trip.id.desc())
        .first()
    )

    if last_trip is None:

        next_number = 1

    else:

        next_number = last_trip.id + 1

    return f"TR{next_number:06d}"
# ==========================================================
# Create Trip
# ==========================================================

def create_trip(
    db: Session,
    payload: TripCreate,
):

    vehicle = _get_vehicle_or_404(
        db,
        payload.vehicle_id,
    )
    # ==========================================================
    # Vehicle Validation
    # ==========================================================

    if vehicle.status != VehicleStatus.AVAILABLE:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected vehicle is not available.",
        )

    if not vehicle.is_active:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle is inactive.",
        )

    driver = _get_driver_or_404(
        db,
        payload.driver_id,
    )
    # ==========================================================
    # Driver Validation
    # ==========================================================

    if driver.status != DriverStatus.AVAILABLE:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected driver is not available.",
        )

    if not driver.is_active:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver is inactive.",
        )
        # ==========================================================
    # License Validation
    # ==========================================================

    if (
        driver.license_expiry_date is None
        or driver.license_expiry_date < date.today()
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver license is expired or not configured.",
        )
        # ==========================================================
    # Cargo Validation
    # ==========================================================

    if payload.cargo_weight > vehicle.maximum_load_capacity:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Cargo weight ({payload.cargo_weight} {payload.cargo_unit}) "
                f"exceeds vehicle capacity "
                f"({vehicle.maximum_load_capacity} {vehicle.capacity_unit})."
            ),
        )

    trip = Trip(

        trip_number=_generate_trip_number(db),

        vehicle_id=vehicle.id,

        driver_id=driver.id,

        source=payload.source,

        destination=payload.destination,

        intermediate_stop=payload.intermediate_stop,

        planned_distance_km=payload.planned_distance_km,

        actual_distance_km=payload.actual_distance_km,

        cargo_name=payload.cargo_name,

        cargo_description=payload.cargo_description,

        cargo_weight=payload.cargo_weight,

        cargo_unit=payload.cargo_unit,

        customer_name=payload.customer_name,

        customer_phone=payload.customer_phone,

        customer_email=payload.customer_email,

        start_odometer=payload.start_odometer,

        end_odometer=payload.end_odometer,

        scheduled_date=payload.scheduled_date,

        dispatch_time=payload.dispatch_time,

        estimated_arrival=payload.estimated_arrival,

        completion_time=payload.completion_time,

        start_latitude=payload.start_latitude,

        start_longitude=payload.start_longitude,

        end_latitude=payload.end_latitude,

        end_longitude=payload.end_longitude,

        estimated_fuel=payload.estimated_fuel,

        actual_fuel=payload.actual_fuel,

        fuel_cost=payload.fuel_cost,

        toll_cost=payload.toll_cost,

        parking_cost=payload.parking_cost,

        other_expense=payload.other_expense,

        priority=payload.priority,

        status="Draft",

        dispatched_by=payload.dispatched_by,

        dispatch_notes=payload.dispatch_notes,

        completion_notes=payload.completion_notes,

        cancellation_reason=payload.cancellation_reason,

        is_active=True,

        created_at=datetime.utcnow(),

        updated_at=datetime.utcnow(),

    )

    try:

        db.add(trip)

        db.commit()

        db.refresh(trip)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to create trip. {str(e)}",
        )

    return {

        "success": True,

        "message": "Trip created successfully.",

        "data": trip,

    }
# ==========================================================
# Get Trip Details
# ==========================================================

def get_trip(
    db: Session,
    trip_id: int,
):

    trip = _get_trip_or_404(
        db,
        trip_id,
    )

    return {

        "success": True,

        "data": trip,

    }
# ==========================================================
# Get All Trips
# ==========================================================

def get_all_trips(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    status: str | None = None,
):

    query = (
        db.query(Trip)
        .filter(
            Trip.is_active == True,
        )
    )

    # ---------------------------------------
    # Search
    # ---------------------------------------

    if search:

        search = f"%{search}%"

        query = query.filter(
            or_(
                Trip.trip_number.ilike(search),
                Trip.source.ilike(search),
                Trip.destination.ilike(search),
                Trip.customer_name.ilike(search),
                Trip.cargo_name.ilike(search),
            )
        )

    # ---------------------------------------
    # Status Filter
    # ---------------------------------------

    if status:

        query = query.filter(
            Trip.status == status
        )

    total = query.count()

    trips = (
        query.order_by(Trip.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {

        "success": True,

        "page": page,

        "page_size": page_size,

        "total_records": total,

        "total_pages": (
            total + page_size - 1
        ) // page_size,

        "data": trips,

    }


# ==========================================================
# Update Trip
# ==========================================================

def update_trip(
    db: Session,
    trip_id: int,
    payload: TripUpdate,
):

    trip = _get_trip_or_404(
        db=db,
        trip_id=trip_id,
    )

    # ---------------------------------------
    # Only Draft Trips Can Be Updated
    # ---------------------------------------

    if trip.status != TripStatus.DRAFT:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Draft trips can be updated.",
        )

    # ---------------------------------------
    # Validate Vehicle
    # ---------------------------------------

    if payload.vehicle_id is not None:

        _get_vehicle_or_404(
            db=db,
            vehicle_id=payload.vehicle_id,
        )

    # ---------------------------------------
    # Validate Driver
    # ---------------------------------------

    if payload.driver_id is not None:

        _get_driver_or_404(
            db=db,
            driver_id=payload.driver_id,
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            trip,
            key,
            value,
        )

    trip.updated_at = datetime.utcnow()

    try:

        db.commit()

        db.refresh(trip)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to update trip. {str(e)}",
        )


# ==========================================================
# Delete Trip
# ==========================================================

def delete_trip(
    db: Session,
    trip_id: int,
):

    trip = _get_trip_or_404(
        db=db,
        trip_id=trip_id,
    )

    # ---------------------------------------
    # Only Draft Trips Can Be Deleted
    # ---------------------------------------

    if trip.status != TripStatus.DRAFT:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Draft trips can be deleted.",
        )

    trip.is_active = False

    trip.updated_at = datetime.utcnow()

    try:

        db.commit()

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to delete trip. {str(e)}",
        )
# ==========================================================
# Dispatch Trip
# ==========================================================

def dispatch_trip(
    db: Session,
    trip_id: int,
    payload: TripDispatch,
):

    # ---------------------------------------
    # Get Trip
    # ---------------------------------------

    trip = _get_trip_or_404(
        db=db,
        trip_id=trip_id,
    )

    # ---------------------------------------
    # Only Draft Trip Can Be Dispatched
    # ---------------------------------------

    if trip.status != TripStatus.DRAFT:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Draft trips can be dispatched.",
        )

    # ---------------------------------------
    # Get Vehicle
    # ---------------------------------------

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=trip.vehicle_id,
    )
    # ==========================================================
    # Check Vehicle Already Assigned
    # ==========================================================

    existing_vehicle_trip = (
        db.query(Trip)
        .filter(
            Trip.vehicle_id == vehicle.id,
            Trip.status == "Dispatched",
            Trip.id != trip.id,
            Trip.is_active == True,
        )
        .first()
    )

    if existing_vehicle_trip:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle is already assigned to another active trip.",
        )

    # ---------------------------------------
    # Get Driver
    # ---------------------------------------

    driver = _get_driver_or_404(
        db=db,
        driver_id=trip.driver_id,
    )

    # ==========================================================
    # Check Driver Already Assigned
    # ==========================================================

    existing_driver_trip = (
        db.query(Trip)
        .filter(
            Trip.driver_id == driver.id,
            Trip.status == "Dispatched",
            Trip.id != trip.id,
            Trip.is_active == True,
        )
        .first()
    )

    if existing_driver_trip:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver is already assigned to another active trip.",
        )

    # ==========================================================
    # Vehicle Validation
    # ==========================================================

    if not vehicle.is_active:

        raise HTTPException(
            status_code=400,
            detail="Vehicle is inactive.",
        )

    if vehicle.status == VehicleStatus.ON_TRIP:

        raise HTTPException(
            status_code=400,
            detail="Vehicle is already assigned to another trip.",
        )

    if vehicle.status == VehicleStatus.IN_SHOP:

        raise HTTPException(
            status_code=400,
            detail="Vehicle is currently under maintenance.",
        )

    if vehicle.status == VehicleStatus.RETIRED:

        raise HTTPException(
            status_code=400,
            detail="Vehicle has been retired.",
        )

    if vehicle.status != VehicleStatus.AVAILABLE:

        raise HTTPException(
            status_code=400,
            detail="Vehicle is not available.",
        )

    # ==========================================================
    # Driver Validation
    # ==========================================================

    if not driver.is_active:

        raise HTTPException(
            status_code=400,
            detail="Driver is inactive.",
        )

    if driver.status == DriverStatus.ON_TRIP:

        raise HTTPException(
            status_code=400,
            detail="Driver is already assigned to another trip.",
        )

    if driver.status == DriverStatus.OFF_DUTY:

        raise HTTPException(
            status_code=400,
            detail="Driver is currently off duty.",
        )

    if driver.status == DriverStatus.SUSPENDED:

        raise HTTPException(
            status_code=400,
            detail="Driver is suspended.",
        )

    if driver.status != DriverStatus.AVAILABLE:

        raise HTTPException(
            status_code=400,
            detail="Driver is not available.",
        )

    # ==========================================================
    # License Validation
    # ==========================================================

    
    if (
        driver.license_expiry_date is None
        or driver.license_expiry_date < date.today()
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver license is expired or not configured.",
        )
    # ==========================================================
    # Cargo Capacity Validation
    # ==========================================================

    if trip.cargo_weight > vehicle.maximum_load_capacity:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Cargo weight ({trip.cargo_weight} {trip.cargo_unit}) "
                f"exceeds vehicle capacity "
                f"({vehicle.maximum_load_capacity} {vehicle.capacity_unit})."
            ),
        )
    # ==========================================================
    # Dispatch Trip
    # ==========================================================

    trip.status = TripStatus.DISPATCHED

    trip.dispatch_time = datetime.utcnow()

    trip.dispatch_notes = payload.dispatch_notes

    trip.updated_at = datetime.utcnow()

    # ---------------------------------------
    # Capture Current Vehicle Odometer
    # ---------------------------------------

    trip.start_odometer = vehicle.odometer

    # ---------------------------------------
    # Capture Current Vehicle GPS
    # ---------------------------------------
    if (
    vehicle.current_latitude is None
    or vehicle.current_longitude is None
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle GPS location is unavailable.",
        )

    trip.start_latitude = vehicle.current_latitude

    trip.start_longitude = vehicle.current_longitude

    trip.updated_at = datetime.utcnow()

    # ==========================================================
    # Update Vehicle
    # ==========================================================

    vehicle.status = VehicleStatus.ON_TRIP

    vehicle.updated_at = datetime.utcnow()

    # ==========================================================
    # Update Driver
    # ==========================================================

    driver.status = DriverStatus.ON_TRIP

    driver.current_vehicle_id = vehicle.id

    driver.updated_at = datetime.utcnow()

    # ==========================================================
    # Commit Transaction
    # ==========================================================

    db.commit()

    db.refresh(trip)

    db.refresh(vehicle)

    db.refresh(driver)

    return {

        "success": True,

        "message": "Trip dispatched successfully.",

        "data": {

            "trip_id": trip.id,

            "trip_number": trip.trip_number,

            "status": trip.status,

            "dispatch_time": trip.dispatch_time,

            "vehicle": {

                "id": vehicle.id,

                "registration_number": vehicle.registration_number,

                "vehicle_name": vehicle.vehicle_name,

                "status": vehicle.status,

            },

            "driver": {

                "id": driver.id,

                "employee_id": driver.employee_id,

                "name": f"{driver.first_name} {driver.last_name}",

                "status": driver.status,

            }

        }

    }
# ==========================================================
# Complete Trip
# ==========================================================

def complete_trip(
    db: Session,
    trip_id: int,
    payload: TripComplete,
):

    # ---------------------------------------
    # Get Trip
    # ---------------------------------------

    trip = _get_trip_or_404(
        db=db,
        trip_id=trip_id,
    )

    # ---------------------------------------
    # Trip Validation
    # ---------------------------------------

    if trip.status != TripStatus.DISPATCHED:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only dispatched trips can be completed.",
        )

    # ---------------------------------------
    # Get Vehicle
    # ---------------------------------------

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=trip.vehicle_id,
    )

    # ---------------------------------------
    # Get Driver
    # ---------------------------------------

    driver = _get_driver_or_404(
        db=db,
        driver_id=trip.driver_id,
    )

    # ---------------------------------------
    # Validate Odometer
    # ---------------------------------------

    if payload.end_odometer < trip.start_odometer:

        raise HTTPException(
            status_code=400,
            detail="End odometer cannot be less than start odometer.",
        )

    # ---------------------------------------
    # Validate Distance
    # ---------------------------------------

    calculated_distance = (
        payload.end_odometer - trip.start_odometer
    )

    if abs(calculated_distance - payload.actual_distance_km) > 5:

        raise HTTPException(
            status_code=400,
            detail="Actual distance does not match odometer reading.",
        )

    try:

        # =====================================================
        # Trip
        # =====================================================

        trip.status = TripStatus.COMPLETED

        trip.completion_time = datetime.utcnow()

        trip.end_odometer = payload.end_odometer

        trip.actual_distance_km = payload.actual_distance_km

        trip.actual_fuel = payload.actual_fuel

        trip.fuel_cost = payload.fuel_cost

        trip.toll_cost = payload.toll_cost

        trip.parking_cost = payload.parking_cost

        trip.other_expense = payload.other_expense

        trip.completion_notes = payload.completion_notes

        trip.end_latitude = vehicle.current_latitude

        trip.end_longitude = vehicle.current_longitude

        trip.updated_at = datetime.utcnow()

        # =====================================================
        # Vehicle
        # =====================================================

        vehicle.status = VehicleStatus.AVAILABLE

        vehicle.odometer = payload.end_odometer

        vehicle.updated_at = datetime.utcnow()

        # =====================================================
        # Driver
        # =====================================================

        driver.status = DriverStatus.AVAILABLE

        driver.current_vehicle_id = None

        driver.total_completed_trips += 1

        driver.total_distance_km += payload.actual_distance_km

        driver.total_driving_hours += (
    payload.actual_distance_km / AVERAGE_SPEED_KMH
)

        driver.updated_at = datetime.utcnow()

        # =====================================================
        # Save
        # =====================================================

        db.commit()

        db.refresh(trip)

        db.refresh(vehicle)

        db.refresh(driver)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to complete trip. {str(e)}",
        )

    return {

        "success": True,

        "message": "Trip completed successfully.",

        "data": {

            "trip_id": trip.id,

            "trip_number": trip.trip_number,

            "status": trip.status,

            "completion_time": trip.completion_time,

            "distance": trip.actual_distance_km,

            "vehicle": {

                "id": vehicle.id,

                "registration_number": vehicle.registration_number,

                "odometer": vehicle.odometer,

                "status": vehicle.status,

            },

            "driver": {

                "id": driver.id,

                "name": f"{driver.first_name} {driver.last_name}",

                "completed_trips": driver.total_completed_trips,

                "total_distance": driver.total_distance_km,

                "status": driver.status,

            }

        }

    }
# ==========================================================
# Cancel Trip
# ==========================================================

def cancel_trip(
    db: Session,
    trip_id: int,
    payload: TripCancel,
):

    trip = _get_trip_or_404(
        db=db,
        trip_id=trip_id,
    )

    if trip.status == TripStatus.COMPLETED:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed trip cannot be cancelled.",
        )

    vehicle = _get_vehicle_or_404(
        db=db,
        vehicle_id=trip.vehicle_id,
    )

    driver = _get_driver_or_404(
        db=db,
        driver_id=trip.driver_id,
    )

    try:

        trip.status = TripStatus.CANCELLED

        trip.cancellation_reason = payload.cancellation_reason

        trip.updated_at = datetime.utcnow()

        # Restore Vehicle

        vehicle.status = VehicleStatus.AVAILABLE

        vehicle.updated_at = datetime.utcnow()

        # Restore Driver

        driver.status = DriverStatus.AVAILABLE

        driver.current_vehicle_id = None

        driver.updated_at = datetime.utcnow()

        db.commit()

        db.refresh(trip)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to cancel trip. {str(e)}",
        )

    return {

        "success": True,

        "message": "Trip cancelled successfully.",

        "data": trip,

    }


# ==========================================================
# Draft Trips
# ==========================================================

def get_draft_trips(
    db: Session,
):

    trips = (
        db.query(Trip)
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.DRAFT,
        )
        .order_by(
            Trip.created_at.desc()
        )
        .all()
    )

    return {

        "success": True,

        "total": len(trips),

        "data": trips,

    }


# ==========================================================
# Live Trips
# ==========================================================

def get_live_trips(
    db: Session,
):

    trips = (
        db.query(Trip)
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.DISPATCHED,
        )
        .order_by(
            Trip.dispatch_time.desc()
        )
        .all()
    )

    return {

        "success": True,

        "total": len(trips),

        "data": trips,

    }


# ==========================================================
# Trip Statistics
# ==========================================================

def trip_statistics(
    db: Session,
):

    total = (
        db.query(func.count(Trip.id))
        .filter(
            Trip.is_active == True
        )
        .scalar()
    )

    draft = (
        db.query(func.count(Trip.id))
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.DRAFT,
        )
        .scalar()
    )

    dispatched = (
        db.query(func.count(Trip.id))
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.DISPATCHED,
        )
        .scalar()
    )

    completed = (
        db.query(func.count(Trip.id))
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.COMPLETED,
        )
        .scalar()
    )

    cancelled = (
        db.query(func.count(Trip.id))
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.CANCELLED,
        )
        .scalar()
    )

    total_distance = (
        db.query(func.sum(Trip.actual_distance_km))
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.COMPLETED,
        )
        .scalar()
    ) or 0

    total_fuel = (
        db.query(func.sum(Trip.actual_fuel))
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.COMPLETED,
        )
        .scalar()
    ) or 0

    total_fuel_cost = (
        db.query(func.sum(Trip.fuel_cost))
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.COMPLETED,
        )
        .scalar()
    ) or 0

    total_expenses = (
        db.query(
            func.sum(
                Trip.toll_cost +
                Trip.parking_cost +
                Trip.other_expense
            )
        )
        .filter(
            Trip.is_active == True,
            Trip.status == TripStatus.COMPLETED,
        )
        .scalar()
    ) or 0

    return {

        "success": True,

        "data": {

            "total_trips": total,

            "draft_trips": draft,

            "running_trips": dispatched,

            "completed_trips": completed,

            "cancelled_trips": cancelled,

            "total_distance_km": round(
                total_distance,
                2,
            ),

            "total_fuel": round(
                total_fuel,
                2,
            ),

            "total_fuel_cost": round(
                total_fuel_cost,
                2,
            ),

            "total_other_expenses": round(
                total_expenses,
                2,
            ),

        }

    }