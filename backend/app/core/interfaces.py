from typing import Protocol, Optional, Dict, Any
from app.models.user import UserInDB, RegistrationSession, TwoFactorMethod
from app.models.report import ReportInDB
from typing import List

class IUserRepository(Protocol):
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        ...
        
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        ...
        
    async def create_user(self, user: UserInDB) -> UserInDB:
        ...

    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> None:
        ...

class IRegistrationRepository(Protocol):
    async def create_session(self, session: RegistrationSession) -> RegistrationSession:
        ...
        
    async def get_session(self, session_id: str) -> Optional[RegistrationSession]:
        ...
        
    async def update_session(self, session_id: str, update_data: Dict[str, Any]) -> None:
        ...
        
    async def delete_session(self, session_id: str) -> None:
        ...

class ITwoFactorProvider(Protocol):
    async def send_code(self, target: str, code: str) -> None:
        ...
        
    def generate_secret(self) -> str:
        ...
        
    def verify_code(self, secret: str, code: str) -> bool:
        ...

class IOtpService(Protocol):
    async def generate_and_send_otp(self, target: str, method: TwoFactorMethod) -> str:
        ...
        
    async def verify_otp(self, target: str, code: str) -> bool:
        ...

class IAuthService(Protocol):
    # Add methods as needed for auth logic
    ...

class IReportRepository(Protocol):
    async def create_report(self, report: ReportInDB) -> ReportInDB:
        ...
        
    async def get_reports_by_user(self, user_id: str) -> List[ReportInDB]:
        ...
        
    async def get_recent_reports(self, limit: int = 10) -> List[ReportInDB]:
        ...
