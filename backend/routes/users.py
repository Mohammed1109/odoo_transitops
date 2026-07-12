from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database.database import get_db
from database.models.user import User
from database.models.role import Role  # adjust import path if different
from middleware.auth import require_auth, require_role  # adjust import path if different

router = APIRouter(prefix="/users", tags=["Users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(raw_password: str) -> str:
    return pwd_context.hash(raw_password)


# ------------------------------------------------------------------
# SCHEMAS
# ------------------------------------------------------------------
class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    username: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    role_id: int
    is_active: Optional[bool] = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    username: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    phone: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    phone: Optional[str] = None
    role_id: int
    is_active: bool
    is_first_login: bool
    showupdated: str
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ------------------------------------------------------------------
# HELPERS
# ------------------------------------------------------------------
def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def _validate_role_exists(db: Session, role_id: int) -> None:
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role_id")


# ------------------------------------------------------------------
# GET /api/users/get_all_users
# ------------------------------------------------------------------
@router.get("/get_all_users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    users = db.query(User).order_by(User.id.asc()).all()
    return users


# ------------------------------------------------------------------
# GET /api/users/get_single_user/{user_id}
# ------------------------------------------------------------------
@router.get("/get_single_user/{user_id}", response_model=UserResponse)
def get_single_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    return _get_user_or_404(db, user_id)


# ------------------------------------------------------------------
# POST /api/users/create_new_user
# ------------------------------------------------------------------
@router.post("/create_new_user", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superAdmin")),
):
    _validate_role_exists(db, payload.role_id)

    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    new_user = User(
        full_name=payload.full_name,
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone=payload.phone,
        role_id=payload.role_id,
        is_active=payload.is_active if payload.is_active is not None else True,
    )

    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not create user")

    db.refresh(new_user)
    return new_user


# ------------------------------------------------------------------
# PUT /api/users/update_user/{user_id}
# ------------------------------------------------------------------
@router.put("/update_user/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superAdmin")),
):
    user = _get_user_or_404(db, user_id)

    if payload.role_id is not None:
        _validate_role_exists(db, payload.role_id)
        user.role_id = payload.role_id

    if payload.username is not None and payload.username != user.username:
        if db.query(User).filter(User.username == payload.username, User.id != user_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
        user.username = payload.username

    if payload.email is not None and payload.email != user.email:
        if db.query(User).filter(User.email == payload.email, User.id != user_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
        user.email = payload.email

    if payload.full_name is not None:
        user.full_name = payload.full_name

    if payload.phone is not None:
        user.phone = payload.phone

    if payload.password:
        user.password_hash = hash_password(payload.password)

    if payload.is_active is not None:
        user.is_active = payload.is_active

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not update user")

    db.refresh(user)
    return user


# ------------------------------------------------------------------
# DELETE /api/users/delete_user/{user_id}
# ------------------------------------------------------------------
@router.delete("/delete_user/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superAdmin")),
):
    user = _get_user_or_404(db, user_id)

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    db.delete(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user (likely referenced elsewhere)",
        )

    return {"message": "User deleted successfully"}