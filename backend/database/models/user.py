from sqlalchemy import Column, Integer #type: ignore

from database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)