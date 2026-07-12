from sqlalchemy import (  # type: ignore
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
from sqlalchemy.orm import relationship #type: ignore
from sqlalchemy.sql import func #type: ignore

from database.database import Base


class Maintenance(Base):

    __tablename__ = "maintenances"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    maintenance_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Vehicle
    # ==========================================================

    vehicle_id = Column(
        Integer,
        ForeignKey(
            "vehicles.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Service Details
    # ==========================================================

    service_type = Column(
        String(100),
        nullable=False,
    )

    description = Column(
        Text,
    )

    service_center = Column(
        String(150),
    )

    vendor_name = Column(
        String(150),
    )

    vendor_contact = Column(
        String(30),
    )

    invoice_number = Column(
        String(100),
    )

    invoice_path = Column(
        String(500),
    )

    # ==========================================================
    # Vehicle Reading
    # ==========================================================

    current_odometer = Column(
        Float,
        default=0,
    )

    next_service_odometer = Column(
        Float,
        default=0,
    )

    # ==========================================================
    # Cost
    # ==========================================================

    labour_cost = Column(
        Float,
        default=0,
    )

    parts_cost = Column(
        Float,
        default=0,
    )

    other_cost = Column(
        Float,
        default=0,
    )

    total_cost = Column(
        Float,
        default=0,
    )

    # ==========================================================
    # Dates
    # ==========================================================

    service_date = Column(
        Date,
        nullable=False,
    )

    expected_completion_date = Column(
        Date,
    )

    completion_date = Column(
        Date,
    )

    # ==========================================================
    # Priority
    # ==========================================================

    priority = Column(
        String(20),
        default="Normal",
    )

    # Low
    # Normal
    # High
    # Critical

    # ==========================================================
    # Status
    # ==========================================================

    status = Column(
        String(30),
        default="Pending",
    )

    # Pending
    # In Progress
    # Completed
    # Cancelled

    # ==========================================================
    # Remarks
    # ==========================================================

    remarks = Column(
        Text,
    )

    created_by = Column(
        String(100),
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
    service_completed_odometer = Column(
    Float,
    default=0,
)

    # ==========================================================
    # Relationships
    # ==========================================================

    vehicle = relationship(
        "Vehicle",
        back_populates="maintenances",
    )