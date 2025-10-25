import os
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Session, create_engine, select

DB_URL = os.getenv("DATABASE_URL", "sqlite:///./aegis.db")
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    external_id: str
    display_name: str

class Observation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    image_path: str
    prob_score: float
    label: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SymptomLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    free_text: str
    urgency: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RiskScore(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    score_0_100: int
    reason: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)

def get_or_create_user(session: Session, external_id: str, display_name: str) -> User:
    user = session.exec(select(User).where(User.external_id == external_id)).first()
    if user:
        return user
    user = User(external_id=external_id, display_name=display_name)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
