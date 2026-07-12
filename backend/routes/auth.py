from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session  # type: ignore

from database.database import get_db
from schemas.user import LoginRequest, LoginResponse, UpdateInitialPasswordRequest
from services.auth import login, update_initial_password

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
    

@auth_router.post("/update_initial_password")
def update_initial_password_route(
    request: UpdateInitialPasswordRequest,
    db: Session = Depends(get_db),
):
    try:

        update_initial_password(
            db=db,
            username_or_email=request.username_or_email,
            current_password=request.current_password,
            new_password=request.new_password,
        )

        return {
            "status": "success",
            "message": "Password updated successfully.",
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )