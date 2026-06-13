from fastapi import APIRouter
from app.api.ping_route import router as ping_router
from app.api.routers.auth import router as auth_router

router = APIRouter()

router.include_router(ping_router, prefix="/ping", tags=["ping"])
router.include_router(auth_router)
