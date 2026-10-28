from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, Boolean
from app.db.base import Base

class ScheduleFrequency(str, enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"

class ScheduledAudit(Base):
    __tablename__ = "scheduled_audits"

    id = Column(Integer, primary_key=True, index=True)
    target_url = Column(String(2048), nullable=False)
    email = Column(String(255), nullable=False)
    frequency = Column(SQLEnum(ScheduleFrequency), default=ScheduleFrequency.WEEKLY, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
