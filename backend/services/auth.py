from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import or_ #type:ignore

from database.models.role import Role
from database.models.user import User

from schemas.user import LoginResponse

from utils.jwt import create_access_token
from utils.password import hash_password, verify_password

from database.types import now_utc


# --------------------------------------------------
# Get User By Username or email
# --------------------------------------------------
def get_user_by_username_or_email(db: Session, username_or_email: str) -> User | None:

    return (
        db.query(User)
        .filter(
            or_(
                User.username == username_or_email,
                User.email == username_or_email,
            )
        )
        .first()
    )
# --------------------------------------------------
# Authenticate User
# --------------------------------------------------
def authenticate_user(db: Session, username_or_email: str, password: str) -> User | None:

    user = get_user_by_username_or_email(db, username_or_email)

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


# --------------------------------------------------
# Login
# --------------------------------------------------
def login(db: Session, username_or_email: str, password: str) -> LoginResponse:

    user = authenticate_user(db,username_or_email,password)

    if not user:
        raise ValueError("Invalid credentials.")

    token = create_access_token(
        {
            "sub": user.username,
            "user_id": user.id,
            "role": user.role.name,
        }
    )

    user.last_login = now_utc()
    db.commit()
    db.refresh(user)

    return LoginResponse(
        access_token=token,
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        role=user.role.name,
        is_first_login=user.is_first_login,
    )


# --------------------------------------------------
# Change Password
# --------------------------------------------------
def change_password(db: Session, user: User, new_password: str) -> None:

    user.password_hash = hash_password(new_password)
    user.is_first_login = False

    db.commit()


# --------------------------------------------------
# Create Default Admin
# --------------------------------------------------
def create_default_admin(db: Session) -> None:

    admin_role = (
        db.query(Role)
        .filter(
            Role.name == "Admin",
        )
        .first()
    )

    if not admin_role:
        admin_role = Role(
            name="Admin",
            description="System Administrator",
        )

        db.add(admin_role)
        db.commit()

        db.refresh(admin_role)

    admin_user = (
        db.query(User)
        .filter(
            User.username == "admin",
        )
        .first()
    )

    if admin_user:
        return

    admin_user = User(
        full_name="System Administrator",
        username="admin",
        email="admin@transitops.local",
        password_hash=hash_password("Admin@123"),
        role_id=admin_role.id,
        is_active=True,
        is_first_login=True,
    )

    db.add(admin_user)
    db.commit()