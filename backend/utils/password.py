from passlib.context import CryptContext  # type: ignore

# --------------------------------------------------
# Password Configuration
# --------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")

# --------------------------------------------------
# Hash Password
# --------------------------------------------------
def hash_password(password: str) -> str:
    """
    Returns a bcrypt hash for the supplied password.
    """
    return pwd_context.hash(password)


# --------------------------------------------------
# Verify Password
# -------------------------------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against the stored bcrypt hash.
    """
    return pwd_context.verify(plain_password, hashed_password)