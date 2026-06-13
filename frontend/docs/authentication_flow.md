# Frontend Authentication Architecture & Implementation Guide

This document provides a reference for implementing the React Native (Expo) frontend for the authentication system. The backend provides a stateless, step-by-step registration API and a 2FA-enabled login API.

## Registration Flow

The registration process requires multiple screens but is managed as a single flow on the frontend. The backend tracks the progress using a temporary `registration_id`.

### Flow Steps
1. **Basic Info (`/register/basic-info`)**
   - **Fields**: Name, Email, Citizenship Number, Citizenship Photo.
   - **Action**: Call `POST /api/auth/register/basic-info`.
   - **Response**: Receives a `registration_id`. This ID must be stored in memory (or Context) and passed to subsequent steps.
2. **Phone Number (`/register/phone`)**
   - **Fields**: Phone number.
   - **Action**: Call `POST /api/auth/register/phone` with `registration_id` and phone.
   - **Response**: Triggers an OTP sent to the phone.
3. **Verify Phone (`/register/verify-phone`)**
   - **Fields**: OTP code.
   - **Action**: Call `POST /api/auth/register/verify-phone` with `registration_id` and OTP.
   - **Response**: Success indicates phone is verified.
4. **Verify Email (`/register/verify-email`)**
   - **Fields**: OTP code.
   - **Pre-action**: Call `POST /api/auth/register/send-email-otp` to send the code.
   - **Action**: Call `POST /api/auth/register/verify-email` with `registration_id` and OTP.
   - **Response**: Success indicates email is verified.
5. **Finalize Password (`/register/finalize`)**
   - **Fields**: Password, Confirm Password.
   - **Action**: Call `POST /api/auth/register/finalize` with `registration_id` and passwords.
   - **Response**: Finalizes account creation and returns the final `access_token` and `refresh_token`.

### State Management
Use a React Context (`RegistrationContext`) to store the `registration_id` and transition between screens seamlessly using `expo-router`.

## Login Flow

### Flow Steps
1. **Credentials (`/login`)**
   - **Fields**: Username or Email, Password.
   - **Action**: Call `POST /api/auth/login`.
   - **Response Options**:
     - Returns `{ "access_token": "..." }` if no 2FA is required.
     - Returns `{ "requires_2fa": true, "login_token": "..." }` if 2FA is required.
2. **2FA Verification (`/login/2fa`)**
   - **Fields**: OTP or Authenticator Code.
   - **Action**: Call `POST /api/auth/login/2fa/verify` with `login_token`, `method` (email, phone, authenticator), and `code`.
   - **Response**: Returns `{ "access_token": "..." }`.

## Enabling 2FA (Authenticator App)
When a user opts to enable TOTP (Authenticator App) in their profile:
1. Call `POST /api/auth/2fa/setup`.
2. Backend returns an `otpauth://` URL.
3. Frontend uses a library like `react-native-qrcode-svg` to render the URL as a QR code.
4. User scans the QR code and enters the generated code.
5. Call `POST /api/auth/2fa/confirm` to finalize setup.
