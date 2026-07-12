from sqlalchemy import Column, Integer #type: ignore

from database.database import Base


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)