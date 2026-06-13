# Copilot Instructions for FastAPI UV Template

## Project Overview

This is a **FastAPI-based service template** using **uv** for dependency management. The application follows a layered architecture with clear separation between API routes, business logic, and ML components. Designed for AI services but flexible for general FastAPI projects.

## Architecture Pattern

### Application Factory Pattern

- `app/main.py` exports the app instance created by `app/core/server.py:create_application()`
- All middleware, routes, and configuration are wired up in `create_application()`
- Never create FastAPI instances elsewhere; always use the factory

### Routing Hierarchy

```
app/main.py (entry)
  └── app/core/server.py (factory)
      ├── / (index route - inline in server.py)
      ├── /health (app/api/health_route.py)
      └── /api/* (app/api/routes.py)
          └── /ping (defined in routes.py)
```

**Adding new routes:**

1. For simple routes: Add to `app/api/routes.py` using the existing `router` with `/api` prefix
2. For modular routes: Create new route file in `app/api/` (e.g., `my_feature_route.py`)
3. Include in `app/core/server.py:create_application()` using `app.include_router(my_feature_route.router)`
4. Routes in `routes.py` automatically get `/api` prefix and `["api"]` tag

### Response Schema Pattern

**Always use standardized responses** from `app/core/schema.py`:

```python
from app.core.schema import BaseResponse, create_success_response, create_error_response

@router.get("/endpoint", response_model=BaseResponse)
async def endpoint():
    return create_success_response(message="Success", data={"key": "value"})
```

Response structure:

```json
{
  "status": "success|failed|error|warning",
  "message": "Human-readable message",
  "data": null | any
}
```

Helper functions available:

- `create_success_response()` → status: "success"
- `create_error_response()` → status: "failed"
- `create_warning_response()` → status: "warning"

### Configuration Management

- All config in `app/core/config.py` using Pydantic Settings
- Environment variables loaded via `python-dotenv` from `.env` file
- Access config globally: `from app.core.config import settings`
- Use `settings.is_production` or `settings.is_development` for environment checks
- Config fields use `os.getenv()` - ensure `.env` has all vars from `.env.example`

### Service Layer Pattern

Business logic goes in `app/services/`:

```python
# app/services/my_service.py
from app.core.schema import BaseResponse, create_success_response

def my_business_logic() -> BaseResponse:
    # Complex logic here
    return create_success_response(...)

# app/api/routes.py
from app.services.my_service import my_business_logic

@router.get("/")
async def endpoint():
    return my_business_logic()
```

Example: `app/services/health.py` implements health check logic called by `app/api/health_route.py`

## Development Workflow

### Running the Application

```bash
# Development with hot reload
uv run fastapi dev

# Production mode
uv run fastapi run
```

Application runs on `http://localhost:8000` by default (configurable via `.env`)

### Dependency Management

```bash
# Install dependencies (from pyproject.toml)
uv sync

# Install with dev dependencies (pytest, ruff, httpx)
uv sync --dev

# Add new dependency
uv add package-name

# Add dev dependency
uv add --dev package-name
```

**Important**: `uv` uses `pyproject.toml` and `uv.lock` for dependency management. Never edit `uv.lock` manually.

### Docker

**Using setup.sh (recommended):**

```bash
chmod +x setup.sh
./setup.sh           # Build and start services
./setup.sh stop      # Stop and remove containers
./setup.sh restart   # Restart services
./setup.sh logs      # Follow container logs
./setup.sh status    # Show running containers
```

**Manual Docker:**

```bash
# Build image
docker build -t fastapi-uv-backend .

# Run container
docker run -p 8000:8000 --env-file .env fastapi-uv-backend
```

**Docker Compose:**

```bash
docker compose up --build -d
docker compose logs -f
docker compose down
```

**Important**:

- Dockerfile uses multi-stage build with `uv sync --frozen --no-cache --no-dev` to ensure reproducible builds
- `docker-compose.yml` mounts ML models directory and uses healthcheck on `/health` endpoint
- Environment variables from `.env` are passed to container

## Project-Specific Conventions

### Middleware Order Matters

In `app/core/server.py`, middlewares are applied in reverse order (last added runs first):

1. Security headers middleware (runs last → adds X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
2. Timing middleware (adds `X-Process-Time` header, logs request duration)
3. TrustedHostMiddleware (production only → validates Host header)
4. CORSMiddleware (runs first → processes CORS headers)

### ML Components

- ML models stored in path from `settings.ml_models_path` env var (default: `ml/models`)
- `ml/` directory is for storing actual model files (.pt, .h5, .pkl)
- `app/ml/` is structured for inference logic, models, and preprocessing code
- Currently placeholder - when implementing ML features, follow this structure

### Models Directory

`app/models/` is for **data models** (DTOs, ORM models), NOT ML models:

- Pydantic models for request/response DTOs
- SQLAlchemy models if database is added
- Domain models/dataclasses

### Logging

- Import logger: `import logging; logger = logging.getLogger(__name__)`
- Log level controlled by `LOG_LEVEL` env var in `.env`
- Request timing is automatically logged by middleware (see `server.py:add_timing`)
- Format: `"{method} {path} - {status_code} ({process_time}s)"`

## Key Files Reference

| File                      | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `app/core/server.py`      | Application factory, middleware setup, root routes |
| `app/core/config.py`      | Centralized configuration (Settings class)         |
| `app/core/schema.py`      | Standard response schemas and helper functions     |
| `app/api/routes.py`       | Main API routes with `/api` prefix                 |
| `app/api/health_route.py` | Health check endpoint                              |
| `pyproject.toml`          | Dependencies and project metadata (managed by uv)  |
| `uv.lock`                 | Locked dependencies (auto-generated, never edit)   |
| `.env.example`            | Example environment variables                      |
| `setup.sh`                | Docker Compose helper script                       |

## Common Tasks

**Add a new API endpoint:**

1. Simple: Add to `app/api/routes.py` with existing router
2. Modular: Create `app/api/my_feature_route.py` with `APIRouter()`
3. Include in `app/core/server.py`: `app.include_router(my_feature_route.router)`
4. Use `BaseResponse` model and `create_success_response()` helper

**Add environment variable:**

1. Add to `.env.example` with example value
2. Add to your local `.env` file
3. Add field to `Settings` class in `app/core/config.py` with `os.getenv("VAR_NAME")`
4. Access via `settings.variable_name`

**Add middleware:**

Add in `app/core/server.py:setup_middlewares()` using:

- `app.add_middleware(MiddlewareClass, ...)` for class-based middleware
- `@app.middleware("http")` decorator for function-based middleware

**Add business logic:**

1. Create service file in `app/services/` (e.g., `my_service.py`)
2. Implement function returning `BaseResponse`
3. Import and call from route handler
4. Follow example in `app/services/health.py`
