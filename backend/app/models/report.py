from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReportBase(BaseModel):
    category: str
    description: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportInDB(ReportBase):
    id: str = Field(alias="_id")
    user_id: str
    status: str = "In Review"
    created_at: datetime
