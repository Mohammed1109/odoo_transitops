from pydantic import BaseModel, ConfigDict


# --------------------------------------------------
# Create Role
# --------------------------------------------------

class RoleCreate(BaseModel):

    name: str
    description: str | None = None


# --------------------------------------------------
# Update Role
# --------------------------------------------------

class RoleUpdate(BaseModel):

    name: str
    description: str | None = None
    is_active: bool


# --------------------------------------------------
# Role Response
# --------------------------------------------------

class RoleResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    is_active: bool