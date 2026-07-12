from sqlalchemy import Boolean,Column, Integer  # type: ignore
from sqlalchemy.orm import relationship  # type: ignore

from database.database import Base
from database.types import UTCDateTime, UString, now_utc


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(UString(100), unique=True, nullable=False, index=True)
    description = Column(UString(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(UTCDateTime(), default=now_utc,nullable=False)
    updated_at = Column(UTCDateTime(), default=now_utc, onupdate=now_utc, nullable=False)
    users = relationship("User",back_populates="role")