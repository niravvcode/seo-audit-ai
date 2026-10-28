from datetime import datetime
from pydantic import BaseModel, HttpUrl

class WebsiteBase(BaseModel):
    url: str
    domain: str

class WebsiteCreate(BaseModel):
    url: str

class WebsiteResponse(WebsiteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
