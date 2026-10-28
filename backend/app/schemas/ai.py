from typing import Optional, List
from pydantic import BaseModel

class AIRecommendationRequest(BaseModel):
    issue_id: int
    custom_prompt: Optional[str] = None

class AIRecommendationResponse(BaseModel):
    issue_id: int
    rule_id: str
    title: str
    ai_explanation: str
    suggested_implementation: str
    code_or_tag_example: Optional[str] = None
    priority_level: str
    disclaimer: str = "AI-generated recommendations provide best-practice guidance and do not guarantee search engine ranking changes."

class AIExecutiveSummaryRequest(BaseModel):
    audit_id: int

class AIExecutiveSummaryResponse(BaseModel):
    audit_id: int
    executive_summary: str
    key_strengths: List[str]
    critical_risks: List[str]
    immediate_actions: List[str]
