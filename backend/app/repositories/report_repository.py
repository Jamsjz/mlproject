from app.core.database import db
from app.models.report import ReportInDB
from typing import List

class MongoReportRepository:
    @property
    def collection(self):
        return db.db["reports"]

        
    async def create_report(self, report: ReportInDB) -> ReportInDB:
        report_dict = report.model_dump(by_alias=True)
        await self.collection.insert_one(report_dict)
        return report

    async def get_reports_by_user(self, user_id: str) -> List[ReportInDB]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        reports = await cursor.to_list(length=100)
        return [ReportInDB(**report) for report in reports]
        
    async def get_recent_reports(self, limit: int = 10) -> List[ReportInDB]:
        cursor = self.collection.find().sort("created_at", -1).limit(limit)
        reports = await cursor.to_list(length=limit)
        return [ReportInDB(**report) for report in reports]
