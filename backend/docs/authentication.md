# Backend Authentication Architecture

This application uses a modular, SOLID-compliant authentication architecture.

## Overview
The backend is built with FastAPI and utilizes MongoDB for data storage via the `motor` async driver. The authentication system supports a step-by-step registration flow and a multi-factor login flow.

## Core Components
### Interfaces (`app/core/interfaces.py`)
To adhere to the Dependency Inversion Principle, all external dependencies and core services are defined via Python `Protocols`:
- `IUserRepository`: Abstracts the MongoDB operations for users and registration sessions.
- `IAuthService`: Defines the business logic for login and registration.
- `ITwoFactorProvider`: Standardizes the interface for sending and verifying 2FA codes (Email, SMS, Authenticator).

### Security (`app/core/security.py`)
Handles JWT generation, parsing, and password hashing using `bcrypt`.

### Database (`app/core/database.py`)
Initializes the MongoDB connection using the `motor` driver. The database URI is sourced from the `.env` configuration.

### Services
- `AuthService`: Implements `IAuthService` and coordinates the registration steps and login flows.
- `TwoFactorProviders`: Implementations of `ITwoFactorProvider` for Email (OTP), Phone (OTP logged to terminal), and Authenticator App (TOTP via `pyotp`).

## API Routes
### Registration
- `POST /api/auth/register/basic-info` -> Returns `registration_id`.
- `POST /api/auth/register/phone` -> Triggers Phone OTP.
- `POST /api/auth/register/verify-phone` -> Verifies Phone OTP.
- `POST /api/auth/register/send-email-otp` -> Triggers Email OTP.
- `POST /api/auth/register/verify-email` -> Verifies Email OTP.
- `POST /api/auth/register/finalize` -> Finalizes registration, returning `access_token`.

### Login
- `POST /api/auth/login` -> Returns `access_token` or `requires_2fa: true`.
- `POST /api/auth/login/2fa/verify` -> Verifies 2FA code and returns `access_token`.

## State Management
The step-by-step registration is stateful on the backend, tracked via an `InProgressRegistration` document in MongoDB. The frontend receives a `registration_id` to link subsequent requests to the ongoing registration session.
