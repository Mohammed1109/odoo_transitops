from pydantic import BaseModel, ConfigDict, EmailStr


# --------------------------------------------------
# Login Request
# --------------------------------------------------

class LoginRequest(BaseModel):

    username: str
    password: str


# --------------------------------------------------
# Login Response
# --------------------------------------------------

class LoginResponse(BaseModel):

    access_token: str
    token_type: str = "bearer"

    full_name: str
    username: str
    email: EmailStr

    role: str

    is_first_login: bool


# --------------------------------------------------
# User Response
# --------------------------------------------------

class UserResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    username: str
    email: EmailStr
    phone: str | None
    role: str
    is_active: bool
    is_first_login: bool