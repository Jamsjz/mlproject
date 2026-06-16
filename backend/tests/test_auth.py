import pytest
from app.models.user import RegistrationStatus, TwoFactorMethod

def test_register_basic_info_success(client):
    response = client.post("/api/auth/register/basic-info", json={
        "name": "John Doe",
        "email": "john@example.com",
        "citizenship_number": "123456789",
        "citizenship_photo_url": "http://example.com/photo.jpg"
    })
    assert response.status_code == 200
    data = response.json()
    assert "registration_id" in data
    assert data["registration_id"] != ""

def test_register_basic_info_invalid_email(client):
    response = client.post("/api/auth/register/basic-info", json={
        "name": "John Doe",
        "email": "not-an-email",
        "citizenship_number": "123456789"
    })
    assert response.status_code == 422 # Unprocessable Entity (Pydantic validation)

def test_register_basic_info_empty_citizenship(client):
    response = client.post("/api/auth/register/basic-info", json={
        "name": "John Doe",
        "email": "john@example.com",
        "citizenship_number": "   "
    })
    assert response.status_code == 400
    assert "Citizenship number is required" in response.json()["detail"]

def test_full_registration_and_login_flow(client, auth_service, mock_otp_service, mock_user_repo):
    # 1. Basic Info
    response = client.post("/api/auth/register/basic-info", json={
        "name": "Jane Doe",
        "email": "jane@example.com",
        "citizenship_number": "987654321"
    })
    assert response.status_code == 200
    reg_id = response.json()["registration_id"]

    # 2. Add Phone
    response = client.post("/api/auth/register/phone", json={
        "registration_id": reg_id,
        "phone": "+1234567890"
    })
    assert response.status_code == 200

    # 3. Verify Phone OTP
    # The mock service returns "000000" but we can also use "123456"
    response = client.post("/api/auth/register/verify-phone", json={
        "registration_id": reg_id,
        "code": "123456"
    })
    assert response.status_code == 200

    # 4. Send Email OTP
    response = client.post(f"/api/auth/register/send-email-otp?registration_id={reg_id}")
    assert response.status_code == 200

    # 5. Verify Email OTP
    response = client.post("/api/auth/register/verify-email", json={
        "registration_id": reg_id,
        "code": "123456"
    })
    assert response.status_code == 200

    # 6. Finalize Registration (Invalid Password)
    response = client.post("/api/auth/register/finalize", json={
        "registration_id": reg_id,
        "password": "weak",
        "confirm_password": "weak"
    })
    assert response.status_code == 422 # Pydantic validation fails

    # 6. Finalize Registration (Passwords don't match)
    response = client.post("/api/auth/register/finalize", json={
        "registration_id": reg_id,
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123"
    })
    assert response.status_code == 400

    # 6. Finalize Registration (Success)
    response = client.post("/api/auth/register/finalize", json={
        "registration_id": reg_id,
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

    # 7. Login Success
    response = client.post("/api/auth/login", json={
        "email": "jane@example.com",
        "password": "StrongPassword123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

    # 8. Login Failure (Wrong password)
    response = client.post("/api/auth/login", json={
        "email": "jane@example.com",
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401
    
    # 9. Setup 2FA
    user = list(mock_user_repo.users.values())[0]
    user.is_2fa_enabled = True
    user.preferred_2fa_method = TwoFactorMethod.EMAIL
    mock_user_repo.users[user.id] = user

    # 10. Login with 2FA required
    response = client.post("/api/auth/login", json={
        "email": "jane@example.com",
        "password": "StrongPassword123!"
    })
    assert response.status_code == 200
    login_data = response.json()
    assert login_data["requires_2fa"] is True
    assert "login_token" in login_data
    
    login_token = login_data["login_token"]
    
    # 11. Verify 2FA code
    response = client.post("/api/auth/login/2fa/verify", json={
        "login_token": login_token,
        "method": "email",
        "code": "123456" # Mock universal code
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_invalid_session_state(client):
    # Try verifying phone before adding phone
    response = client.post("/api/auth/register/basic-info", json={
        "name": "Test User",
        "email": "test@example.com",
        "citizenship_number": "123"
    })
    reg_id = response.json()["registration_id"]
    
    response = client.post("/api/auth/register/verify-phone", json={
        "registration_id": reg_id,
        "code": "123456"
    })
    # Should fail because state is BASIC_INFO, not PHONE_PENDING
    assert response.status_code == 400
    assert "Invalid session state" in response.json()["detail"]
