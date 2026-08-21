from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):

    username: str

    email: EmailStr

    password: str


class LoginResponse(BaseModel):

    access_token: str

    token_type: str

    user: dict


class UserResponse(BaseModel):

    id: str

    username: str

    email: str

    role: str

    status: str

    is_active: bool