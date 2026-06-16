from fastapi import APIRouter, Depends
from typing import List
from app.api.deps import get_current_user
from app.models.user import UserInDB
from app.models.report import ReportCreate, ReportInDB
from app.services.report_service import ReportService
from app.repositories.report_repository import MongoReportRepository

router = APIRouter(prefix="/reports", tags=["Reports"])

def get_report_service() -> ReportService:
    repo = MongoReportRepository()
    return ReportService(repo)

@router.post("", response_model=ReportInDB)
async def create_report(
    report: ReportCreate,
    current_user: UserInDB = Depends(get_current_user),
    service: ReportService = Depends(get_report_service)
):
    return await service.submit_report(current_user.id, report)

@router.get("/me", response_model=List[ReportInDB])
async def get_my_reports(
    current_user: UserInDB = Depends(get_current_user),
    service: ReportService = Depends(get_report_service)
):
    return await service.get_user_reports(current_user.id)

@router.get("/recent", response_model=List[ReportInDB])
async def get_recent_reports(
    current_user: UserInDB = Depends(get_current_user),
    service: ReportService = Depends(get_report_service)
):
    return await service.get_recent_reports()
