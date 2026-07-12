from sqlalchemy import Boolean, Column, Date, DateTime, Float, Integer, String #type: ignore

from database.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)

    registration_number = Column(String(50), unique=True, nullable=False, index=True)

    vehicle_name = Column(String(150), nullable=False)

    vehicle_model = Column(String(150))

    manufacturer = Column(String(100))

    vehicle_type = Column(String(50), nullable=False)

    maximum_load_capacity = Column(Float, nullable=False)

    capacity_unit = Column(String(10), default="kg")

    odometer = Column(Float, default=0)

    acquisition_cost = Column(Float, default=0)

    purchase_date = Column(Date)

    color = Column(String(50))

    chassis_number = Column(String(100))

    engine_number = Column(String(100))

    vin_number = Column(String(100))

    fuel_type = Column(String(30))

    fuel_tank_capacity = Column(Float)

    gps_tracker_id = Column(String(100))

    current_latitude = Column(Float)

    current_longitude = Column(Float)

    insurance_number = Column(String(100))

    insurance_expiry = Column(Date)

    registration_expiry = Column(Date)

    permit_expiry = Column(Date)

    status = Column(
        String(30),
        default="Available"
    )

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)