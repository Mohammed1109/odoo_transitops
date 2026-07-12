from sqlalchemy import Column, Integer #type: ignore

from database.database import Base


class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)