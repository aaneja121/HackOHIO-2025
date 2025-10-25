from sqlmodel import SQLModel, create_engine, Session
from app.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=False)

def init_db() -> None:
    from app import models_db  # ensure models are imported
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
