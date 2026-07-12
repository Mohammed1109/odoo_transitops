from sqlalchemy import func  # type: ignore
from sqlalchemy.orm import Session  # type: ignore

from database.models.role import Role
from database.models.user import User


# --------------------------------------------------
# Create Role
# --------------------------------------------------

def create_role(
    db: Session,
    name: str,
    description: str | None,
) -> Role:

    name = name.strip()

    if not name:
        raise ValueError("Role name cannot be empty.")

    existing_role = (
        db.query(Role)
        .filter(
            func.lower(Role.name) == name.lower(),
        )
        .first()
    )

    if existing_role:
        raise ValueError("Role already exists.")

    role = Role(
        name=name,
        description=description,
    )

    db.add(role)
    db.commit()
    db.refresh(role)

    return role


# --------------------------------------------------
# Get All Roles
# --------------------------------------------------

def get_roles(
    db: Session,
) -> list[Role]:

    return (
        db.query(Role)
        .order_by(Role.name.asc())
        .all()
    )


# --------------------------------------------------
# Get Role By ID
# --------------------------------------------------

def get_role_by_id(
    db: Session,
    role_id: int,
) -> Role:

    role = (
        db.query(Role)
        .filter(
            Role.id == role_id,
        )
        .first()
    )

    if not role:
        raise ValueError("Role not found.")

    return role


# --------------------------------------------------
# Update Role
# --------------------------------------------------

def update_role(
    db: Session,
    role_id: int,
    name: str,
    description: str | None,
    is_active: bool,
) -> Role:

    role = get_role_by_id(
        db=db,
        role_id=role_id,
    )

    if not name:
        raise ValueError("Role name cannot be empty.")

    if role.name.lower() == "admin":
        raise ValueError("The Admin role cannot be modified.")

    duplicate_role = (
        db.query(Role)
        .filter(
            func.lower(Role.name) == name.strip().lower(),
            Role.id != role_id,
        )
        .first()
    )

    if duplicate_role:
        raise ValueError("Role name already exists.")

    role.name = name.strip()
    role.description = description
    role.is_active = is_active

    db.commit()
    db.refresh(role)

    return role


# --------------------------------------------------
# Delete Role
# --------------------------------------------------

def delete_role(
    db: Session,
    role_id: int,
) -> None:

    role = get_role_by_id(
        db=db,
        role_id=role_id,
    )
    if role.name.lower() == "admin":
        raise ValueError("The Admin role cannot be deleted.")

    assigned_users = (
        db.query(User)
        .filter(
            User.role_id == role_id,
        )
        .count()
    )

    if assigned_users:
        raise ValueError(
            "Role cannot be deleted because it is assigned to one or more users."
        )

    db.delete(role)
    db.commit()