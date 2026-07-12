from datetime import datetime, timezone

from sqlalchemy import Unicode, UnicodeText  # type: ignore
from sqlalchemy.types import DateTime as _DateTime, TypeDecorator  # type: ignore


# --------------------------------------------------
# Common SQLAlchemy Types
# --------------------------------------------------

UString = Unicode
UText = UnicodeText


# --------------------------------------------------
# UTC Helpers
# --------------------------------------------------

def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class UTCDateTime(TypeDecorator):
    """
    Stores datetime in UTC.
    Returns timezone-aware UTC datetime.
    """

    impl = _DateTime
    cache_ok = True

    def _ensure_utc(self, value):

        if value is None:
            return None

        if value.tzinfo is None:
            value = value.replace(
                tzinfo=timezone.utc,
            )

        return value.astimezone(timezone.utc)

    def process_bind_param(self, value, dialect):

        value = self._ensure_utc(value)

        if value is None:
            return None

        # PostgreSQL stores UTC internally
        return value.replace(tzinfo=None)

    def process_result_value(self, value, dialect):

        if value is None:
            return None

        return value.replace(
            tzinfo=timezone.utc,
        )

