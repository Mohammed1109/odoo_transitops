from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    Integer,
    String,
)
from sqlalchemy.sql import func

from database.database import Base


class Driver(Base):

    __tablename__ = "drivers"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(Integer, primary_key=True, index=True)

    # ==========================================================
    # Personal Information
    # ==========================================================

    first_name = Column(String(100), nullable=False)

    last_name = Column(String(100), nullable=False)

    employee_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    email = Column(
        String(150),
        unique=True,
        nullable=True,
    )

    phone_number = Column(
        String(20),
        nullable=False,
    )

    emergency_contact = Column(String(20))

    address = Column(String(300))

    city = Column(String(100))

    state = Column(String(100))

    country = Column(String(100))

    postal_code = Column(String(20))

    date_of_birth = Column(Date)

    gender = Column(String(20))

    blood_group = Column(String(10))

    # ==========================================================
    # Employment Details
    # ==========================================================

    joining_date = Column(Date)

    designation = Column(String(100))

    department = Column(String(100))

    experience_years = Column(Integer, default=0)

    employee_type = Column(
        String(30),
        default="Permanent",
    )

    # ==========================================================
    # Driving License
    # ==========================================================

    license_number = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    license_category = Column(
        String(50),
        nullable=False,
    )

    license_issue_date = Column(Date)

    license_expiry_date = Column(
        Date,
        nullable=False,
    )

    issuing_authority = Column(String(150))

    # ==========================================================
    # Safety & Compliance
    # ==========================================================

    safety_score = Column(
        Float,
        default=100,
    )

    accident_count = Column(
        Integer,
        default=0,
    )

    violation_count = Column(
        Integer,
        default=0,
    )

    suspension_reason = Column(String(300))

    # ==========================================================
    # Driver Performance
    # ==========================================================

    total_completed_trips = Column(
        Integer,
        default=0,
    )

    total_distance_km = Column(
        Float,
        default=0,
    )

    total_driving_hours = Column(
        Float,
        default=0,
    )

    average_rating = Column(
        Float,
        default=5,
    )

    # ==========================================================
    # Driver Availability
    # ==========================================================

    status = Column(
        String(30),
        default="Available",
    )

    current_vehicle_id = Column(Integer)

    # ==========================================================
    # Documents
    # ==========================================================

    aadhaar_number = Column(String(20))

    pan_number = Column(String(20))

    profile_photo = Column(String(500))

    driving_license_document = Column(String(500))

    medical_certificate = Column(String(500))

    police_verification_document = Column(String(500))

    # ==========================================================
    # GPS / Mobile
    # ==========================================================

    device_id = Column(String(100))

    last_known_latitude = Column(Float)

    last_known_longitude = Column(Float)

    last_location_update = Column(DateTime)

    # ==========================================================
    # Additional Notes
    # ==========================================================

    remarks = Column(String(1000))

    # ==========================================================
    # System
    # ==========================================================

    is_active = Column(
        Boolean,
        default=True,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )