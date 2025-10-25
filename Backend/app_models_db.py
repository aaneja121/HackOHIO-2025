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
    prob_score: float            # 0..1 probability of infection  (renamed from model_score)
    label: str                   # "healthy" | "infected"

class SymptomLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    free_text: str
    urgency: float               # 0..1 (heuristic)

class RiskScore(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    created
