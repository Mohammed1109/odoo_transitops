from sqlalchemy import Column, Integer #type: ignore

from database.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)