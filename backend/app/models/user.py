from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class TwoFactorMethod(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    AUTHENTICATOR = "authenticator"

class RegistrationStatus(str, Enum):
    BASIC_INFO = "basic_info"
    PHONE_PENDING = "phone_pending"
    PHONE_VERIFIED = "phone_verified"
    EMAIL_VERIFIED = "email_verified"
    COMPLETED = "completed"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    citizenship_number: str
    phone_number: Optional[str] = None
    is_2fa_enabled: bool = False
    preferred_2fa_method: Optional[TwoFactorMethod] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    authenticator_secret: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class RegistrationSession(BaseModel):
    id: str = Field(alias="_id")
    status: RegistrationStatus
    name: str
    email: EmailStr
    citizenship_number: str
    citizenship_photo_url: Optional[str] = None
    phone_number: Optional[str] = None
    hashed_password: Optional[str] = None
    expires_at: datetime

class TokenResponse(BaseModel):
    access_token: Optional[str] = None
    token_type: str = "bearer"
    requires_2fa: bool = False
    login_token: Optional[str] = None
