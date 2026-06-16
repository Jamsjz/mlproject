from typing import List
from uuid import uuid4
from datetime import datetime, timezone
from app.models.report import ReportCreate, ReportInDB
from app.core.interfaces import IReportRepository

class ReportService:
    def __init__(self, report_repo: IReportRepository):
        self.report_repo = report_repo
        
    async def submit_report(self, user_id: str, report_data: ReportCreate) -> ReportInDB:
        new_report = ReportInDB(
            _id=str(uuid4()),
            user_id=user_id,
            category=report_data.category,
            description=report_data.description,
            location=report_data.location,
            latitude=report_data.latitude,
            longitude=report_data.longitude,
            image_url=report_data.image_url,
            status="In Review",
            created_at=datetime.now(timezone.utc)
        )
        return await self.report_repo.create_report(new_report)

    async def get_user_reports(self, user_id: str) -> List[ReportInDB]:
        return await self.report_repo.get_reports_by_user(user_id)
        
    async def get_recent_reports(self) -> List[ReportInDB]:
        return await self.report_repo.get_recent_reports(limit=10)
