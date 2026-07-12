import os
from datetime import datetime, timedelta, timezone

from database.types import now_utc
from dotenv import load_dotenv  # type: ignore
from jose import JWTError, jwt  # type: ignore

# --------------------------------------------------
# Load Environment
# --------------------------------------------------
load_dotenv()

# --------------------------------------------------
# JWT Configuration
# --------------------------------------------------
SECRET_KEY = os.getenv("JWT_SECRET_KEY")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_EXPIRE_MINUTES",
        "480",
    )
)

if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY is missing from .env")


# --------------------------------------------------
# Create Access Token
# --------------------------------------------------
def create_access_token(data: dict) -> str:

    payload = data.copy()

    expire = now_utc() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload["exp"] = expire

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# --------------------------------------------------
# Decode Token
# --------------------------------------------------
def decode_access_token(token: str) -> dict:

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        raise ValueError("Invalid or expired access token.")