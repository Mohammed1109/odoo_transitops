from sqlalchemy import Boolean,Column, ForeignKey, Integer, String  # type: ignore
from sqlalchemy.orm import Mapped, mapped_column, relationship  # type: ignore

from database.database import Base
from database.types import UTCDateTime, UString, now_utc


class User(Base):
    __tablename__ = "users"

    id= Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(UString(200), nullable=False)
    username = Column(UString(100), unique=True, nullable=False, index=True)
    email = Column(UString(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(UString(20), nullable=True)
    role_id = Column(
        ForeignKey(
            "roles.id",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    is_active = Column(Boolean, default=True, nullable=False)
    is_first_login = Column(Boolean, default=True, nullable=False)
    showupdated = Column(UString(50),nullable=False,server_default="not_updated")
    last_login = Column(UTCDateTime(), nullable=True,)
    created_at = Column(UTCDateTime(), default=now_utc, nullable=False,)
    updated_at = Column(UTCDateTime(), default=now_utc, onupdate=now_utc, nullable=False,)

    role = relationship(
        "Role",
        back_populates="users",
    )