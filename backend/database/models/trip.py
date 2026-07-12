from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer #type: ignore
from sqlalchemy.orm import relationship  # type: ignore

from database.database import Base
from database.types import (
    UTCDateTime,
    UString,
    UText,
    now_utc,
)


class Trip(Base):

    __tablename__ = "trips"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(Integer, primary_key=True, autoincrement=True)

    trip_number = Column(
        UString(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Vehicle & Driver
    # ==========================================================

    vehicle_id = Column(
        Integer,
        ForeignKey(
            "vehicles.id",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    driver_id = Column(
        Integer,
        ForeignKey(
            "drivers.id",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Route Information
    # ==========================================================

    source = Column(
        UString(200),
        nullable=False,
    )

    destination = Column(
        UString(200),
        nullable=False,
    )

    intermediate_stop = Column(
        UString(500),
    )

    planned_distance_km = Column(
        Float,
        default=0,
    )

    actual_distance_km = Column(
        Float,
        default=0,
    )

    # ==========================================================
    # Cargo
    # ==========================================================

    cargo_name = Column(
        UString(200),
    )

    cargo_description = Column(
        UText,
    )

    cargo_weight = Column(
        Float,
        nullable=False,
    )

    cargo_unit = Column(
        UString(20),
        default="kg",
    )

    # ==========================================================
    # Customer
    # ==========================================================

    customer_name = Column(
        UString(150),
    )

    customer_phone = Column(
        UString(20),
    )

    customer_email = Column(
        UString(150),
    )

    priority = Column(
        UString(20),
        default="Normal",
    )

    # ==========================================================
    # Odometer
    # ==========================================================

    start_odometer = Column(
        Float,
        default=0,
    )

    end_odometer = Column(
        Float,
        default=0,
    )

    # ==========================================================
    # Time
    # ==========================================================

    scheduled_date = Column(Date)

    dispatch_time = Column(UTCDateTime())

    estimated_arrival = Column(UTCDateTime())

    completion_time = Column(UTCDateTime())

    # ==========================================================
    # GPS
    # ==========================================================

    start_latitude = Column(Float)

    start_longitude = Column(Float)

    end_latitude = Column(Float)

    end_longitude = Column(Float)

    # ==========================================================
    # Fuel
    # ==========================================================

    estimated_fuel = Column(
        Float,
        default=0,
    )

    actual_fuel = Column(
        Float,
        default=0,
    )

    fuel_cost = Column(
        Float,
        default=0,
    )

    # ==========================================================
    # Expenses
    # ==========================================================

    toll_cost = Column(
        Float,
        default=0,
    )

    parking_cost = Column(
        Float,
        default=0,
    )

    other_expense = Column(
        Float,
        default=0,
    )

    # ==========================================================
    # Status
    # ==========================================================

    status = Column(
        UString(30),
        default="Draft",
    )

    # Draft
    # Dispatched
    # Completed
    # Cancelled

    # ==========================================================
    # Dispatch
    # ==========================================================

    dispatched_by = Column(
        UString(100),
    )

    dispatch_notes = Column(
        UText,
    )

    completion_notes = Column(
        UText,
    )

    cancellation_reason = Column(
        UText,
    )

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

    vehicle = relationship(
        "Vehicle",
        back_populates="trips",
    )

    driver = relationship(
        "Driver",
        back_populates="trips",
    )