from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
from fastapi import HTTPException, status
from app.core.interfaces import IUserRepository, IRegistrationRepository, IOtpService
from app.models.user import UserInDB, RegistrationSession, RegistrationStatus, TwoFactorMethod, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token, create_temporary_token

class AuthService:
    def __init__(
        self, 
        user_repo: IUserRepository, 
        reg_repo: IRegistrationRepository,
        otp_service: IOtpService
    ):
        self.user_repo = user_repo
        self.reg_repo = reg_repo
        self.otp_service = otp_service

    async def start_registration(self, name: str, email: str, citizenship_number: str, photo_url: Optional[str]) -> str:
        existing_user = await self.user_repo.get_user_by_email(email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            
        session_id = str(uuid.uuid4())
        session = RegistrationSession(
            _id=session_id,
            status=RegistrationStatus.BASIC_INFO,
            name=name,
            email=email,
            citizenship_number=citizenship_number,
            citizenship_photo_url=photo_url,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        await self.reg_repo.create_session(session)
        return session_id

    async def add_phone_and_send_otp(self, session_id: str, phone: str) -> None:
        session = await self.reg_repo.get_session(session_id)
        if not session or session.status != RegistrationStatus.BASIC_INFO:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session state")
            
        await self.reg_repo.update_session(session_id, {
            "phone_number": phone,
            "status": RegistrationStatus.PHONE_PENDING
        })
        await self.otp_service.generate_and_send_otp(phone, TwoFactorMethod.PHONE)

    async def verify_phone_otp(self, session_id: str, code: str) -> None:
        session = await self.reg_repo.get_session(session_id)
        if not session or session.status != RegistrationStatus.PHONE_PENDING:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session state")
            
        is_valid = await self.otp_service.verify_otp(session.phone_number, code)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
            
        await self.reg_repo.update_session(session_id, {"status": RegistrationStatus.PHONE_VERIFIED})
        
    async def send_email_otp(self, session_id: str) -> None:
        session = await self.reg_repo.get_session(session_id)
        if not session or session.status != RegistrationStatus.PHONE_VERIFIED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session state")
            
        await self.otp_service.generate_and_send_otp(session.email, TwoFactorMethod.EMAIL)
        
    async def verify_email_otp(self, session_id: str, code: str) -> None:
        session = await self.reg_repo.get_session(session_id)
        if not session or session.status != RegistrationStatus.PHONE_VERIFIED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session state")
            
        is_valid = await self.otp_service.verify_otp(session.email, code)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
            
        await self.reg_repo.update_session(session_id, {"status": RegistrationStatus.EMAIL_VERIFIED})

    async def finalize_registration(self, session_id: str, password: str) -> TokenResponse:
        session = await self.reg_repo.get_session(session_id)
        if not session or session.status != RegistrationStatus.EMAIL_VERIFIED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session state")
            
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(password)
        
        user = UserInDB(
            _id=user_id,
            name=session.name,
            email=session.email,
            citizenship_number=session.citizenship_number,
            phone_number=session.phone_number,
            hashed_password=hashed_password,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        await self.user_repo.create_user(user)
        await self.reg_repo.delete_session(session_id)
        
        access_token = create_access_token(subject=user_id)
        return TokenResponse(access_token=access_token)

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self.user_repo.get_user_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
            
        if user.is_2fa_enabled:
            login_token = create_temporary_token(subject=user.id, token_type="2fa")
            # Automatically send OTP if preferred method is email or phone
            if user.preferred_2fa_method in [TwoFactorMethod.EMAIL, TwoFactorMethod.PHONE]:
                target = user.email if user.preferred_2fa_method == TwoFactorMethod.EMAIL else user.phone_number
                await self.otp_service.generate_and_send_otp(target, user.preferred_2fa_method)
            return TokenResponse(requires_2fa=True, login_token=login_token)
            
        access_token = create_access_token(subject=user.id)
        return TokenResponse(access_token=access_token)
