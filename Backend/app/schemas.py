from pydantic import BaseModel, Field
from typing import Optional

class LoginRequest(BaseModel):
    external_id: str
    display_name: str

class LoginResponse(BaseModel):
    api_key: str

class SymptomIn(BaseModel):
    text: str

class SymptomOut(BaseModel):
    urgency: float

class InferenceOut(BaseModel):
    status: str           # "Healthy" or "Warning: Potential Infection Detected"
    probability: float    # 0..1
    label: str            # "healthy" | "infected"

class RiskOut(BaseModel):
    risk: int = Field(ge=0, le=100)
    reason: str
