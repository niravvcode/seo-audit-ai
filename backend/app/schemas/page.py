from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class PageBase(BaseModel):
    url: str
    status_code: Optional[int] = None
    response_time_ms: Optional[float] = None
    depth: int
    title: Optional[str] = None
    meta_description: Optional[str] = None
    h1_count: int = 0
    content_hash: Optional[str] = None
    word_count: int = 0
    error_message: Optional[str] = None

class PageResponse(PageBase):
    id: int
    audit_id: int
    created_at: datetime

    class Config:
        from_attributes = True
