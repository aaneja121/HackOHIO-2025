from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class PingResponse(BaseModel):
    status: str = Field(default="ok")

class UploadResponse(BaseModel):
    name: str
    size: int

class PredictResponse(BaseModel):
    filename: str
    content_type: str
    predictions: List[float]

# --- User Schemas ---
class UserBase(BaseModel):
    external_id: str
    display_name: str

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: int

# --- Symptom Log Schemas ---
class SymptomLogBase(BaseModel):
    free_text: str
    urgency: float

class SymptomLogCreate(SymptomLogBase):
    user_external_id: str  # We use external_id to link, looking up the user internally

class SymptomLogRead(SymptomLogBase):
    id: int
    user_id: int
    created_at: datetime
