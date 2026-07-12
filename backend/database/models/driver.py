from sqlalchemy import Column, Integer #type: ignore

from database.database import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)