import re
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.schedule import ScheduledAudit, ScheduleFrequency
from app.services.crawler.security import validate_target_url

router = APIRouter()

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class ScheduleCreate(BaseModel):
    target_url: str
    email: str
    frequency: ScheduleFrequency = ScheduleFrequency.WEEKLY

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email format")
        return v

class ScheduleResponse(BaseModel):
    id: int
    target_url: str
    email: str
    frequency: ScheduleFrequency
    is_active: bool
    last_run_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/schedules", response_model=ScheduleResponse)
def create_schedule(req: ScheduleCreate, db: Session = Depends(get_db)):
    safe, reason = validate_target_url(req.target_url)
    if not safe:
        raise HTTPException(status_code=400, detail=f"Invalid target URL: {reason}")

    sched = ScheduledAudit(
        target_url=req.target_url,
        email=req.email,
        frequency=req.frequency,
        is_active=True
    )
    db.add(sched)
    db.commit()
    db.refresh(sched)
    return sched

@router.get("/schedules", response_model=List[ScheduleResponse])
def list_schedules(db: Session = Depends(get_db)):
    return db.query(ScheduledAudit).order_by(ScheduledAudit.created_at.desc()).all()

@router.delete("/schedules/{sched_id}")
def delete_schedule(sched_id: int, db: Session = Depends(get_db)):
    sched = db.query(ScheduledAudit).filter(ScheduledAudit.id == sched_id).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(sched)
    db.commit()
    return {"message": "Scheduled monitoring removed"}
