from sqlalchemy import Boolean, Integer  # type: ignore
from sqlalchemy.orm import Mapped, mapped_column, relationship  # type: ignore

from database.database import Base
from database.types import UTCDateTime, UString, now_utc


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(UString(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(UString(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime(), default=now_utc,nullable=False)
    updated_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime(), default=now_utc, onupdate=now_utc, nullable=False)
    users = relationship("User",back_populates="role")