# Government Infrastructure Reporting System

A professional, cross-platform application designed to allow citizens to report infrastructural issues (such as roads, buildings, and utilities) efficiently. 

This repository is organized as a monorepo containing both the backend API and the mobile frontend application.

## Project Structure

```
mlproject/
├── backend/    # FastAPI Python backend
└── frontend/   # React Native (Expo) mobile frontend
```

## Architecture & Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB (via `motor` async driver)
- **Architecture**: SOLID Principles, Dependency Injection, Protocol-based repositories.
- **Security**: Robust step-by-step registration flow, Multi-factor Authentication (Email, Phone, TOTP Authenticator apps), `bcrypt` password hashing, and JWT authorization.
- **Package Management**: `uv`

### Frontend
- **Framework**: React Native with Expo (v56)
- **Routing**: Expo Router
- **Features**: Cross-platform support (iOS, Android, Web), modular component architecture.

## Getting Started

### 1. Backend Setup
Navigate to the `backend` directory to configure and run the API server.

```bash
cd backend
# Install dependencies using uv
uv sync

# Run the development server
uv run fastapi dev
```
*Note: Make sure to review `backend/.env` for configuration options (MongoDB URL, Secret Keys, etc.). More details in `backend/README.md`.*

### 2. Frontend Setup
Navigate to the `frontend` directory to start the Expo development server.

```bash
cd frontend
# Install dependencies
npm install

# Start the Expo development server
npm start
```
*Note: The frontend architecture and authentication flows are heavily documented in `frontend/docs/authentication_flow.md`.*

## Documentation
- [Backend Authentication Architecture](backend/docs/authentication.md)
- [Frontend Authentication Flow](frontend/docs/authentication_flow.md)

## License
MIT License
