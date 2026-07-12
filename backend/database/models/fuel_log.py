from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey,Integer, String,Text #type:ignore

from sqlalchemy.sql import func #type:ignore
from sqlalchemy.orm import relationship #type:ignore

from database.database import Base
from database.types import (
    UTCDateTime,
    UString,
    now_utc,
    UText
)


class FuelLog(Base):

    __tablename__ = "fuel_logs"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ==========================================================
    # Vehicle / Driver / Trip
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
        nullable=True,
        index=True,
    )

    trip_id = Column(
        Integer,
        ForeignKey("trips.id"),
        nullable=True,
        index=True,
    )

    # ==========================================================
    # Fuel Details
    # ==========================================================

    fuel_date = Column(
        Date,
        nullable=False,
    )

    fuel_type = Column(
        UString(30),
        nullable=False,
    )

    liters = Column(
        Float,
        nullable=False,
    )

    price_per_liter = Column(
        Float,
        nullable=False,
    )

    total_cost = Column(
        Float,
        default=0,
    )

    # ==========================================================
    # Odometer
    # ==========================================================

    odometer = Column(
        Float,
        nullable=False,
    )

    # ==========================================================
    # Fuel Station
    # ==========================================================

    fuel_station = Column(
        UString(150),
    )

    station_location = Column(
        UString(200),
    )

    # ==========================================================
    # Payment
    # ==========================================================

    payment_method = Column(
        UString(50),
    )

    invoice_number = Column(
        UString(100),
    )

    invoice_path = Column(
        UString(500),
    )

    # ==========================================================
    # Remarks
    # ==========================================================

    remarks = Column(
        UText,
    )

    created_by = Column(
        UString(100),
    )

    # ==========================================================
    # System
    # ==========================================================

    is_active = Column(
        Boolean,
        default=True,
    )

    created_at = Column(
        UTCDateTime,
        server_default=now_utc(),
        nullable=False,
    )

    updated_at = Column(
        UTCDateTime,
        server_default=now_utc(),
        onupdate=now_utc(),
        nullable=False,
    )

    # ==========================================================
    # Relationships
    # ==========================================================

    vehicle = relationship(
        "Vehicle",
        back_populates="fuel_logs",
    )

    driver = relationship(
        "Driver",
        back_populates="fuel_logs",
    )

    trip = relationship(
        "Trip",
        back_populates="fuel_logs",
    )