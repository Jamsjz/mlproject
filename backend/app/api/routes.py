from fastapi import APIRouter
from app.api.ping_route import router as ping_router
from app.api.routers.auth import router as auth_router
from app.api.routers.users import router as users_router
from app.api.routers.reports import router as reports_router

router = APIRouter()

router.include_router(ping_router, prefix="/ping", tags=["ping"])
router.include_router(auth_router)
router.include_router(users_router)
router.include_router(reports_router)
