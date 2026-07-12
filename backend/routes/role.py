from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session  # type: ignore

from database.database import get_db
from database.models.user import User

from middleware.auth import require_role

from schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
)

from services.role import (
    create_role,
    get_roles,
    get_role_by_id,
    update_role,
    delete_role,
)

role_router = APIRouter()


# --------------------------------------------------
# Create Role
# --------------------------------------------------

@role_router.post(
    "/",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_role(
    request: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):

    try:
        return create_role(
            db=db,
            name=request.name,
            description=request.description,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# --------------------------------------------------
# Get All Roles
# --------------------------------------------------

@role_router.get(
    "/",
    response_model=list[RoleResponse],
)
def get_all_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):

    return get_roles(db)


# --------------------------------------------------
# Get Role By ID
# --------------------------------------------------

@role_router.get(
    "/{role_id}",
    response_model=RoleResponse,
)
def get_single_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):

    try:
        return get_role_by_id(
            db=db,
            role_id=role_id,
        )
        

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


# --------------------------------------------------
# Update Role
# --------------------------------------------------

@role_router.put(
    "/{role_id}",
    response_model=RoleResponse,
)
def update_existing_role(
    role_id: int,
    request: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):

    try:
        
        return update_role(
            db=db,
            role_id=role_id,
            name=request.name,
            description=request.description,
            is_active=request.is_active,
        )
    

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# --------------------------------------------------
# Delete Role
# --------------------------------------------------

@role_router.delete(
    "/{role_id}",
)
def remove_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin")),
):

    try:
        delete_role(
            db=db,
            role_id=role_id,
        )

        return {
            "message": "Role deleted successfully."
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )