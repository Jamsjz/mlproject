import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.routers.auth import get_auth_service
from app.services.auth_service import AuthService
from tests.mocks import MockUserRepository, MockRegistrationRepository, MockOtpService

@pytest.fixture
def mock_user_repo():
    return MockUserRepository()

@pytest.fixture
def mock_reg_repo():
    return MockRegistrationRepository()

@pytest.fixture
def mock_otp_service():
    return MockOtpService()

@pytest.fixture
def auth_service(mock_user_repo, mock_reg_repo, mock_otp_service):
    return AuthService(mock_user_repo, mock_reg_repo, mock_otp_service)

@pytest.fixture
def client(auth_service):
    # Override the dependency in the app
    def _get_test_auth_service():
        return auth_service

    app.dependency_overrides[get_auth_service] = _get_test_auth_service
    
    with TestClient(app) as test_client:
        yield test_client
        
    # Clear overrides after test
    app.dependency_overrides.clear()
