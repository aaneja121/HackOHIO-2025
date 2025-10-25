from pydantic import BaseModel, Field

class LoginIn(BaseModel):
    external_id: str
    display_name: str

class LoginOut(BaseModel):
    api_key: str

class SymptomIn(BaseModel):
    text: str = Field(..., min_length=1)

class SymptomOut(BaseModel):
    urgency: float

class AssessOut(BaseModel):
    status: str
    probability: float
    label: str

class RiskOut(BaseModel):
    risk: int
    reason: str
