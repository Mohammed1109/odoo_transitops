from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session  # type: ignore

from database.database import get_db
from schemas.user import LoginRequest, LoginResponse
from services.auth import login

auth_router = APIRouter()


# --------------------------------------------------
# Login
# --------------------------------------------------

@auth_router.post("/login",response_model=LoginResponse)
def login_user(request: LoginRequest, db: Session = Depends(get_db)):

    try:
        return login(
            db=db,
            username_or_email=request.username_or_email,
            password=request.password,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )