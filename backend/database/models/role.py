from sqlalchemy import Column, Integer #type: ignore

from database.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)