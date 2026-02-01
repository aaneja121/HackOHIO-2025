from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import List 
from sqlmodel import Session, select

from .auth import require_api_key
from .schemas import (
    PingResponse, 
    UploadResponse,
    PredictResponse,
    UserCreate, 
    UserRead, 
    SymptomLogCreate,
    SymptomLogRead
)
from .model import load_model, preprocess_image 
from .db import init_db, get_session, User, SymptomLog, get_or_create_user

load_dotenv()

app = FastAPI()

# --- Model Loading & DB Init ---
@app.on_event("startup")
def startup_event():
    """
    Load the AI model and initialize database.
    """
    # 1. Load Model
    model_path = "app/wound_model_multiclass_finetuned.h5"
    app.state.model = load_model(model_path)
    if app.state.model is None:
        print(f"FATAL: Model from {model_path} could not be loaded.")
    
    # 2. Init DB
    init_db()
    print("Database initialized.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
def root() -> dict:
    return {"status": "ok", "docs": "/docs"}

@app.get("/health", response_model=PingResponse)
def health() -> PingResponse:
    return PingResponse()

# --- User Endpoints ---
@app.post("/users", response_model=UserRead)
def create_user(user_data: UserCreate, session: Session = Depends(get_session)):
    """
    Creates a user or returns existing one if external_id matches.
    """
    user = get_or_create_user(session, external_id=user_data.external_id, display_name=user_data.display_name)
    return user

@app.get("/users/{external_id}", response_model=UserRead)
def get_user(external_id: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.external_id == external_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- Data/Log Endpoints ---
@app.post("/symptom-logs", response_model=SymptomLogRead)
def create_symptom_log(log_data: SymptomLogCreate, session: Session = Depends(get_session)):
    # 1. Find user
    user = session.exec(select(User).where(User.external_id == log_data.user_external_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Create user first.")
    
    # 2. Create log
    new_log = SymptomLog(
        user_id=user.id,
        free_text=log_data.free_text,
        urgency=log_data.urgency
    )
    session.add(new_log)
    session.commit()
    session.refresh(new_log)
    return new_log

@app.get("/symptom-logs", response_model=List[SymptomLogRead])
def get_symptom_logs(external_id: str, session: Session = Depends(get_session)):
    """
    Get all logs for a given user (by external_id).
    """
    user = session.exec(select(User).where(User.external_id == external_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    logs = session.exec(select(SymptomLog).where(SymptomLog.user_id == user.id)).all()
    return logs


# --- AI Endpoints ---
@app.get("/secure", dependencies=[Depends(require_api_key)])
def secure_ping() -> dict:
    return {"ok": True}

@app.post("/upload", response_model=UploadResponse, dependencies=[Depends(require_api_key)])
async def upload(file: UploadFile = File(...)) -> UploadResponse:
    # This endpoint remains the same, just for uploading
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    return UploadResponse(name=file.filename, size=len(data))

@app.post("/predict", response_model=PredictResponse, dependencies=[Depends(require_api_key)])
async def predict(file: UploadFile = File(...)) -> PredictResponse:
    """
    Accepts an image file, preprocesses it, runs it through the loaded AI model,
    and returns the model's predictions.
    """
    if not app.state.model:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        processed_image = preprocess_image(image_bytes)
        
        raw_predictions = app.state.model.predict(processed_image)
        
        predictions_list = raw_predictions[0].tolist()
        
        return PredictResponse(
            filename=file.filename,
            content_type=file.content_type,
            predictions=predictions_list
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {e}")
