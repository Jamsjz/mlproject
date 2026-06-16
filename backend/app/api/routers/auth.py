from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re
from app.services.auth_service import AuthService
from app.services.two_factor import OtpService, AuthenticatorProvider
from app.repositories.user_repository import MongoUserRepository, MongoRegistrationRepository
from app.models.user import TokenResponse, TwoFactorMethod
from app.core.security import decode_token

router = APIRouter(prefix="/auth")

registration_router = APIRouter(prefix="/register", tags=["Registration"])
login_router = APIRouter(prefix="/login", tags=["Login"])
two_factor_router = APIRouter(prefix="/2fa", tags=["Two Factor Authentication"])

def get_auth_service():
    user_repo = MongoUserRepository()
    reg_repo = MongoRegistrationRepository()
    otp_service = OtpService()
    return AuthService(user_repo, reg_repo, otp_service)

# Schemas
class BasicInfoRequest(BaseModel):
    name: str
    email: EmailStr
    citizenship_number: str
    citizenship_photo_url: Optional[str] = None

class PhoneRequest(BaseModel):
    registration_id: str
    phone: str

class VerifyOtpRequest(BaseModel):
    registration_id: str
    code: str

class FinalizeRequest(BaseModel):
    registration_id: str
    password: str
    confirm_password: str
    
    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"[0-9]", v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one special character')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Verify2FALoginRequest(BaseModel):
    login_token: str
    method: TwoFactorMethod
    code: str

# Endpoints
@registration_router.post("/basic-info")
async def register_basic_info(req: BasicInfoRequest, auth_service: AuthService = Depends(get_auth_service)):
    # Citizenship string validation
    print("hello")
    if not req.citizenship_number.strip():
        raise HTTPException(status_code=400, detail="Citizenship number is required")
        
    session_id = await auth_service.start_registration(req.name, req.email, req.citizenship_number, req.citizenship_photo_url)
    return {"registration_id": session_id}

@registration_router.post("/phone")
async def register_phone(req: PhoneRequest, auth_service: AuthService = Depends(get_auth_service)):
    await auth_service.add_phone_and_send_otp(req.registration_id, req.phone)
    return {"message": "OTP sent to phone"}

@registration_router.post("/verify-phone")
async def verify_phone(req: VerifyOtpRequest, auth_service: AuthService = Depends(get_auth_service)):
    await auth_service.verify_phone_otp(req.registration_id, req.code)
    return {"message": "Phone verified successfully"}

@registration_router.post("/send-email-otp")
async def send_email_otp(registration_id: str, auth_service: AuthService = Depends(get_auth_service)):
    await auth_service.send_email_otp(registration_id)
    return {"message": "OTP sent to email"}

@registration_router.post("/verify-email")
async def verify_email(req: VerifyOtpRequest, auth_service: AuthService = Depends(get_auth_service)):
    await auth_service.verify_email_otp(req.registration_id, req.code)
    return {"message": "Email verified successfully"}

@registration_router.post("/finalize", response_model=TokenResponse)
async def finalize_registration(req: FinalizeRequest, auth_service: AuthService = Depends(get_auth_service)):
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    return await auth_service.finalize_registration(req.registration_id, req.password)

@login_router.post("", response_model=TokenResponse)
async def login(req: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.login(req.email, req.password)

@login_router.post("/2fa/verify", response_model=TokenResponse)
async def verify_2fa_login(req: Verify2FALoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    payload = decode_token(req.login_token)
    if not payload or payload.get("type") != "2fa":
        raise HTTPException(status_code=401, detail="Invalid or expired login token")
        
    user_id = payload.get("sub")
    user = await auth_service.user_repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    is_valid = False
    if req.method == TwoFactorMethod.AUTHENTICATOR:
        is_valid = AuthenticatorProvider().verify_code(user.authenticator_secret, req.code)
    else:
        target = user.email if req.method == TwoFactorMethod.EMAIL else user.phone_number
        is_valid = await auth_service.otp_service.verify_otp(target, req.code)

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    from app.core.security import create_access_token
    access_token = create_access_token(subject=user.id)
    return TokenResponse(access_token=access_token)

@two_factor_router.post("/setup")
async def setup_authenticator(user_id: str, auth_service: AuthService = Depends(get_auth_service)):
    # Note: user_id should be extracted from current authenticated user token in real app
    user = await auth_service.user_repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    secret = AuthenticatorProvider().generate_secret()
    # In real app, save secret to user temporarily until confirmed
    await auth_service.user_repo.update_user(user_id, {"authenticator_secret": secret})
    
    import urllib.parse
    issuer = urllib.parse.quote("GovReportApp")
    account = urllib.parse.quote(user.email)
    otpauth_url = f"otpauth://totp/{issuer}:{account}?secret={secret}&issuer={issuer}"
    
    return {"otpauth_url": otpauth_url}

router.include_router(registration_router)
router.include_router(login_router)
router.include_router(two_factor_router)
