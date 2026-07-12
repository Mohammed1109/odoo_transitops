from sqlalchemy import Boolean, Column, Date, Float, Integer #type:ignore

from sqlalchemy.orm import relationship  # type: ignore

from database.database import Base
from database.types import UTCDateTime, UString, now_utc


class Driver(Base):

    __tablename__ = "drivers"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(Integer, primary_key=True, autoincrement=True)

    # ==========================================================
    # Personal Information
    # ==========================================================
    first_name = Column(UString(100), nullable=False)
    last_name = Column(UString(100), nullable=False)
    employee_id = Column(
        UString(50),
        unique=True,
        nullable=False,
        index=True,
    )

    email = Column(
        UString(150),
        unique=True,
        nullable=True,
    )

    phone_number = Column(UString(20), nullable=False)
    emergency_contact = Column(UString(20))
    address = Column(UString(300))
    city = Column(UString(100))
    state = Column(UString(100))
    country = Column(UString(100))
    postal_code = Column(UString(20))
    date_of_birth = Column(Date)
    gender = Column(UString(20))
    blood_group = Column(UString(10))

    # ==========================================================
    # Employment Details
    # ==========================================================
    joining_date = Column(Date)
    designation = Column(UString(100))
    department = Column(UString(100))
    experience_years = Column(Integer, default=0)
    employee_type = Column(UString(30), default="Permanent")

    # ==========================================================
    # Driving License
    # ==========================================================
    license_number = Column(
        UString(100),
        unique=True,
        nullable=False,
        index=True,
    )

    license_category = Column(UString(50), nullable=False,)
    license_issue_date = Column(Date)
    license_expiry_date = Column(Date,nullable=False)
    issuing_authority = Column(UString(150))

    # ==========================================================
    # Safety & Compliance
    # ==========================================================
    safety_score = Column(Float, default=100)
    accident_count = Column(Integer, default=0)
    violation_count = Column(Integer,default=0)

    suspension_reason = Column(UString(300))

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
        UString(30),
        default="Available",
    )

    current_vehicle_id = Column(Integer)

    # ==========================================================
    # GPS / Mobile
    # ==========================================================

    device_id = Column(UString(100))

    last_known_latitude = Column(Float)

    last_known_longitude = Column(Float)

    last_location_update = Column(UTCDateTime())

    # ==========================================================
    # Additional Notes
    # ==========================================================

    remarks = Column(UString(1000))

    # ==========================================================
    # System
    # ==========================================================

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at = Column(
        UTCDateTime(),
        default=now_utc,
        nullable=False,
    )

    updated_at = Column(
        UTCDateTime(),
        default=now_utc,
        onupdate=now_utc,
        nullable=False,
    )

    # ==========================================================
    # Relationships
    # ==========================================================

    trips = relationship(
        "Trip",
        back_populates="driver",
    )

    fuel_logs = relationship(
        "FuelLog",
        back_populates="driver",
    )