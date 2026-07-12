from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database.database import Base


class Trip(Base):

    __tablename__ = "trips"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(Integer, primary_key=True, index=True)

    trip_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Vehicle & Driver
    # ==========================================================

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=False,
        index=True,
    )

    driver_id = Column(
        Integer,
        ForeignKey("drivers.id"),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Route Information
    # ==========================================================

    source = Column(
        String(200),
        nullable=False,
    )

    destination = Column(
        String(200),
        nullable=False,
    )

    intermediate_stop = Column(
        String(500),
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
        String(200),
    )

    cargo_description = Column(
        Text,
    )

    cargo_weight = Column(
        Float,
        nullable=False,
    )

    cargo_unit = Column(
        String(20),
        default="kg",
    )

    # ==========================================================
    # Customer
    # ==========================================================

    customer_name = Column(
        String(150),
    )

    customer_phone = Column(
        String(20),
    )

    customer_email = Column(
        String(150),
    )
    priority = Column(
    String(20),
    default="Normal",)

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

    dispatch_time = Column(DateTime)

    estimated_arrival = Column(DateTime)

    completion_time = Column(DateTime)

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
        String(30),
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
        String(100),
    )

    dispatch_notes = Column(
        Text,
    )

    completion_notes = Column(
        Text,
    )

    cancellation_reason = Column(
        Text,
    )

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
    vehicle = relationship(
    "Vehicle",
    back_populates="trips",
    )

    driver = relationship(
        "Driver",
        back_populates="trips",
    )