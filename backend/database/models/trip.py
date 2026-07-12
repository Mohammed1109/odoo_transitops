from sqlalchemy import Column, Integer #type: ignore

from database.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)