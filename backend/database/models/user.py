from sqlalchemy import Boolean, ForeignKey, Integer, String  # type: ignore
from sqlalchemy.orm import Mapped, mapped_column, relationship  # type: ignore

from database.database import Base
from database.types import UTCDateTime, UString, now_utc


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(UString(200), nullable=False)
    username: Mapped[str] = mapped_column(UString(100), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(UString(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(UString(20), nullable=True)
    role_id: Mapped[int] = mapped_column(
        ForeignKey(
            "roles.id",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_first_login: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login: Mapped[UTCDateTime | None] = mapped_column(UTCDateTime(), nullable=True,)
    created_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime(), default=now_utc, nullable=False,)
    updated_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime(), default=now_utc, onupdate=now_utc, nullable=False,)

    role = relationship(
        "Role",
        back_populates="users",
    )