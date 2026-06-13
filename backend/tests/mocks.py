from typing import Optional, Dict, Any
from datetime import datetime, timezone
from app.core.interfaces import IUserRepository, IRegistrationRepository, IOtpService
from app.models.user import UserInDB, RegistrationSession, TwoFactorMethod

class MockUserRepository(IUserRepository):
    def __init__(self):
        self.users: Dict[str, UserInDB] = {}

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        for user in self.users.values():
            if user.email == email:
                return user
        return None

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        return self.users.get(user_id)

    async def create_user(self, user: UserInDB) -> UserInDB:
        self.users[user.id] = user
        return user

    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> None:
        user = self.users.get(user_id)
        if user:
            user_dict = user.model_dump(by_alias=True)
            user_dict.update(update_data)
            self.users[user_id] = UserInDB(**user_dict)

class MockRegistrationRepository(IRegistrationRepository):
    def __init__(self):
        self.sessions: Dict[str, RegistrationSession] = {}

    async def create_session(self, session: RegistrationSession) -> RegistrationSession:
        self.sessions[session.id] = session
        return session

    async def get_session(self, session_id: str) -> Optional[RegistrationSession]:
        return self.sessions.get(session_id)

    async def update_session(self, session_id: str, update_data: Dict[str, Any]) -> None:
        session = self.sessions.get(session_id)
        if session:
            session_dict = session.model_dump(by_alias=True)
            session_dict.update(update_data)
            self.sessions[session_id] = RegistrationSession(**session_dict)

    async def delete_session(self, session_id: str) -> None:
        if session_id in self.sessions:
            del self.sessions[session_id]

class MockOtpService(IOtpService):
    def __init__(self):
        self.otps: Dict[str, str] = {}
        self.sent_messages = []

    async def generate_and_send_otp(self, target: str, method: TwoFactorMethod) -> str:
        # Predictable OTP for testing
        code = "000000"
        self.otps[target] = code
        self.sent_messages.append({"target": target, "method": method, "code": code})
        return code

    async def verify_otp(self, target: str, code: str) -> bool:
        if code == "123456": # universal code for testing logic
            return True
        return self.otps.get(target) == code
