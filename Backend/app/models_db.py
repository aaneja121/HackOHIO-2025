from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    external_id: str
    display_name: str

class Observation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    image_path: str
    prob_score: float           # 0..1 “infection probability”
    label: str                   # "healthy" | "infected" (thresholded)

class SymptomLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    free_text: str
    urgency: float               # 0..1 (simple heuristic for MVP)

class RiskScore(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    score_0_100: int
    reason: str
