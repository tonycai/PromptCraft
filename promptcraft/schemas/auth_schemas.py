# promptcraft/schemas/auth_schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True # Updated for Pydantic v2 (orm_mode in v1)

class Token(BaseModel):
    access_token: str
    refresh_token: str # Added refresh token
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None # Or email, or user_id, depending on what you put in JWT 'sub'
    # Add other claims you expect, like 'id' or 'scopes'
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    username: str # Can be username or email
    password: str

class Msg(BaseModel):
    message: str

class EmailVerificationRequest(BaseModel):
    email: EmailStr

class VerifyTokenRequest(BaseModel):
    token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class SetNewPasswordRequest(BaseModel):
    token: str # Password reset token
    new_password: str = Field(..., min_length=8) 