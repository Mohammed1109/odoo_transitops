from sqlalchemy import Boolean, Column, Date, Float, Integer #type: ignore
from sqlalchemy.orm import relationship  # type: ignore

from database.database import Base
from database.types import (
    UTCDateTime,
    UString,
    now_utc,
)


class Vehicle(Base):

    __tablename__ = "vehicles"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # ==========================================================
    # Vehicle Information
    # ==========================================================

    registration_number = Column(
        UString(50),
        unique=True,
        nullable=False,
        index=True,
    )

    vehicle_name = Column(
        UString(150),
        nullable=False,
    )

    vehicle_model = Column(
        UString(150),
    )

    manufacturer = Column(
        UString(100),
    )

    vehicle_type = Column(
        UString(50),
        nullable=False,
    )

    color = Column(
        UString(50),
    )

    # ==========================================================
    # Capacity
    # ==========================================================

    maximum_load_capacity = Column(
        Float,
        nullable=False,
    )

    capacity_unit = Column(
        UString(10),
        default="kg",
    )

    # ==========================================================
    # Vehicle Details
    # ==========================================================

    odometer = Column(
        Float,
        default=0,
    )

    acquisition_cost = Column(
        Float,
        default=0,
    )

    purchase_date = Column(Date)

    chassis_number = Column(
        UString(100),
    )

    engine_number = Column(
        UString(100),
    )

    vin_number = Column(
        UString(100),
    )

    # ==========================================================
    # Fuel
    # ==========================================================

    fuel_type = Column(
        UString(30),
    )

    fuel_tank_capacity = Column(
        Float,
    )

    # ==========================================================
    # GPS
    # ==========================================================

    gps_tracker_id = Column(
        UString(100),
    )

    current_latitude = Column(
        Float,
    )

    current_longitude = Column(
        Float,
    )

    # ==========================================================
    # Documents
    # ==========================================================

    insurance_number = Column(
        UString(100),
    )

    insurance_expiry = Column(Date)

    registration_expiry = Column(Date)

    permit_expiry = Column(Date)

    # ==========================================================
    # Status
    # ==========================================================

    status = Column(
        UString(30),
        default="Available",
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ==========================================================
    # System
    # ==========================================================

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
        back_populates="vehicle",
    )

    maintenances = relationship(
        "Maintenance",
        back_populates="vehicle",
    )

    fuel_logs = relationship(
        "FuelLog",
        back_populates="vehicle",
    )