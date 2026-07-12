from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database.models.driver import Driver

from schemas.driver import (
    DriverCreate,
    DriverUpdate,
    DriverStatusUpdate,
    DriverSafetyUpdate,
)


# ==========================================================
# Helper Functions
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found.",
        )

    return driver


def _check_employee_exists(
    db: Session,
    employee_id: str,
    exclude_driver_id: int | None = None,
):

    query = db.query(Driver).filter(
        Driver.employee_id == employee_id
    )

    if exclude_driver_id is not None:
        query = query.filter(
            Driver.id != exclude_driver_id
        )

    if query.first():
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists.",
        )


def _check_license_exists(
    db: Session,
    license_number: str,
    exclude_driver_id: int | None = None,
):

    query = db.query(Driver).filter(
        Driver.license_number == license_number
    )

    if exclude_driver_id is not None:
        query = query.filter(
            Driver.id != exclude_driver_id
        )

    if query.first():
        raise HTTPException(
            status_code=400,
            detail="License number already exists.",
        )


# ==========================================================
# Create Driver
# ==========================================================

def create_driver(
    db: Session,
    payload: DriverCreate,
):

    # ---------------------------------------
    # Validations
    # ---------------------------------------

    _check_employee_exists(
        db=db,
        employee_id=payload.employee_id,
    )

    _check_license_exists(
        db=db,
        license_number=payload.license_number,
    )

    driver = Driver(

        # Personal Information

        first_name=payload.first_name,

        last_name=payload.last_name,

        employee_id=payload.employee_id,

        email=payload.email,

        phone_number=payload.phone_number,

        emergency_contact=payload.emergency_contact,

        address=payload.address,

        city=payload.city,

        state=payload.state,

        country=payload.country,

        postal_code=payload.postal_code,

        date_of_birth=payload.date_of_birth,

        gender=payload.gender,

        blood_group=payload.blood_group,

        # Employment

        joining_date=payload.joining_date,

        designation=payload.designation,

        department=payload.department,

        experience_years=payload.experience_years,

        employee_type=payload.employee_type,

        # License

        license_number=payload.license_number,

        license_category=payload.license_category,

        license_issue_date=payload.license_issue_date,

        license_expiry_date=payload.license_expiry_date,

        issuing_authority=payload.issuing_authority,

        # Safety

        safety_score=payload.safety_score,

        accident_count=payload.accident_count,

        violation_count=payload.violation_count,

        suspension_reason=payload.suspension_reason,

        # Statistics

        total_completed_trips=payload.total_completed_trips,

        total_distance_km=payload.total_distance_km,

        total_driving_hours=payload.total_driving_hours,

        average_rating=payload.average_rating,

        # Status

        status=payload.status,

        current_vehicle_id=payload.current_vehicle_id,

        # Documents

        aadhaar_number=payload.aadhaar_number,

        pan_number=payload.pan_number,

        profile_photo=payload.profile_photo,

        driving_license_document=payload.driving_license_document,

        medical_certificate=payload.medical_certificate,

        police_verification_document=payload.police_verification_document,

        # GPS

        device_id=payload.device_id,

        last_known_latitude=payload.last_known_latitude,

        last_known_longitude=payload.last_known_longitude,

        # Remarks

        remarks=payload.remarks,

        is_active=payload.is_active,

        created_at=datetime.utcnow(),

        updated_at=datetime.utcnow(),
    )

    db.add(driver)

    db.commit()

    db.refresh(driver)

    return {

        "success": True,

        "message": "Driver created successfully.",

        "data": driver,
    }


# ==========================================================
# Get Driver Details
# ==========================================================

def get_driver(
    db: Session,
    driver_id: int,
):

    driver = _get_driver_or_404(
        db=db,
        driver_id=driver_id,
    )

    return {

        "success": True,

        "data": driver,
    }
# ==========================================================
# Get All Drivers
# ==========================================================

def get_all_drivers(
    db: Session,
    status: str | None = None,
):

    query = db.query(Driver).filter(
        Driver.is_active == True
    )

    # ---------------------------------------
    # Status Filter
    # ---------------------------------------

    if status:

        query = query.filter(
            Driver.status == status
        )

    # ---------------------------------------
    # Total Records
    # ---------------------------------------

    total = query.count()

    # ---------------------------------------
    # Pagination
    # ---------------------------------------

    drivers = (
        query.order_by(Driver.id.desc())
        .all()
    )

    return {

        "success": True,

        "total_records": total,

        "data": drivers,
    }


# ==========================================================
# Update Driver
# ==========================================================

def update_driver(
    db: Session,
    driver_id: int,
    payload: DriverUpdate,
):

    driver = _get_driver_or_404(
        db=db,
        driver_id=driver_id,
    )

    # ---------------------------------------
    # Employee ID Validation
    # ---------------------------------------

    if payload.employee_id:

        _check_employee_exists(
            db=db,
            employee_id=payload.employee_id,
            exclude_driver_id=driver.id,
        )

    # ---------------------------------------
    # License Validation
    # ---------------------------------------

    if payload.license_number:

        _check_license_exists(
            db=db,
            license_number=payload.license_number,
            exclude_driver_id=driver.id,
        )

    # ---------------------------------------
    # Update only supplied fields
    # ---------------------------------------

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            driver,
            key,
            value,
        )

    driver.updated_at = datetime.utcnow()

    db.commit()

    db.refresh(driver)

    return {

        "success": True,

        "message": "Driver updated successfully.",

        "data": driver,
    }


# ==========================================================
# Delete Driver
# ==========================================================

def delete_driver(
    db: Session,
    driver_id: int,
):

    driver = _get_driver_or_404(
        db=db,
        driver_id=driver_id,
    )

    # ---------------------------------------
    # Soft Delete
    # ---------------------------------------

    driver.is_active = False

    driver.updated_at = datetime.utcnow()

    db.commit()

    return {

        "success": True,

        "message": "Driver deleted successfully.",
    }
# ==========================================================
# Get Available Drivers
# ==========================================================

def get_available_drivers(
    db: Session,
):

    drivers = (
        db.query(Driver)
        .filter(
            Driver.is_active == True,
            Driver.status == "Available",
        )
        .order_by(
            Driver.first_name.asc(),
            Driver.last_name.asc(),
        )
        .all()
    )

    return {

        "success": True,

        "total": len(drivers),

        "data": drivers,
    }


# ==========================================================
# Driver Dropdown
# ==========================================================

def get_driver_dropdown(
    db: Session,
):

    drivers = (
        db.query(Driver)
        .filter(
            Driver.is_active == True,
            Driver.status == "Available",
        )
        .order_by(
            Driver.first_name.asc(),
            Driver.last_name.asc(),
        )
        .all()
    )

    dropdown = []

    for driver in drivers:

        dropdown.append({

            "id": driver.id,

            "name": f"{driver.first_name} {driver.last_name}",

            "employee_id": driver.employee_id,

            "license_number": driver.license_number,

        })

    return {

        "success": True,

        "data": dropdown,
    }


# ==========================================================
# Driver Statistics
# ==========================================================

def driver_statistics(
    db: Session,
):

    total = (
        db.query(func.count(Driver.id))
        .filter(
            Driver.is_active == True,
        )
        .scalar()
    )

    available = (
        db.query(func.count(Driver.id))
        .filter(
            Driver.is_active == True,
            Driver.status == "Available",
        )
        .scalar()
    )

    on_trip = (
        db.query(func.count(Driver.id))
        .filter(
            Driver.is_active == True,
            Driver.status == "On Trip",
        )
        .scalar()
    )

    off_duty = (
        db.query(func.count(Driver.id))
        .filter(
            Driver.is_active == True,
            Driver.status == "Off Duty",
        )
        .scalar()
    )

    suspended = (
        db.query(func.count(Driver.id))
        .filter(
            Driver.is_active == True,
            Driver.status == "Suspended",
        )
        .scalar()
    )

    average_safety_score = (
        db.query(func.avg(Driver.safety_score))
        .filter(
            Driver.is_active == True,
        )
        .scalar()
    )

    total_completed_trips = (
        db.query(func.sum(Driver.total_completed_trips))
        .filter(
            Driver.is_active == True,
        )
        .scalar()
    ) or 0

    total_distance = (
        db.query(func.sum(Driver.total_distance_km))
        .filter(
            Driver.is_active == True,
        )
        .scalar()
    ) or 0

    return {

        "success": True,

        "data": {

            "total": total,

            "available": available,

            "on_trip": on_trip,

            "off_duty": off_duty,

            "suspended": suspended,

            "average_safety_score": round(
                average_safety_score or 0,
                2,
            ),

            "total_completed_trips": total_completed_trips,

            "total_distance_km": round(
                total_distance,
                2,
            ),

        },
    }
# ==========================================================
# Change Driver Status
# ==========================================================

def change_driver_status(
    db: Session,
    driver_id: int,
    payload: DriverStatusUpdate,
):

    driver = _get_driver_or_404(
        db=db,
        driver_id=driver_id,
    )

    valid_status = [
        "Available",
        "On Trip",
        "Off Duty",
        "Suspended",
    ]

    if payload.status not in valid_status:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid driver status. Allowed values: {', '.join(valid_status)}",
        )

    driver.status = payload.status

    if payload.status != "Suspended":
        driver.suspension_reason = None

    driver.updated_at = datetime.utcnow()

    db.commit()

    db.refresh(driver)

    return {

        "success": True,

        "message": "Driver status updated successfully.",

        "data": driver,
    }


# ==========================================================
# Update Driver Safety Score
# ==========================================================

def update_driver_safety(
    db: Session,
    driver_id: int,
    payload: DriverSafetyUpdate,
):

    driver = _get_driver_or_404(
        db=db,
        driver_id=driver_id,
    )

    driver.safety_score = payload.safety_score

    driver.updated_at = datetime.utcnow()

    db.commit()

    db.refresh(driver)

    return {

        "success": True,

        "message": "Driver safety score updated successfully.",

        "data": driver,
    }


# ==========================================================
# Get Driver Live Location
# ==========================================================

def get_driver_location(
    db: Session,
    driver_id: int,
):

    driver = _get_driver_or_404(
        db=db,
        driver_id=driver_id,
    )

    return {

        "success": True,

        "data": {

            "driver_id": driver.id,

            "driver_name": f"{driver.first_name} {driver.last_name}",

            "employee_id": driver.employee_id,

            "latitude": driver.last_known_latitude,

            "longitude": driver.last_known_longitude,

            "status": driver.status,

            "current_vehicle_id": driver.current_vehicle_id,

            "last_updated": driver.last_location_update,

        },
    }