from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import List 

from .auth import require_api_key
from .schemas import PingResponse, UploadResponse
from .model import load_model, preprocess_image 
from pydantic import BaseModel 
load_dotenv()

app = FastAPI()

# --- Model Loading ---
@app.on_event("startup")
def startup_event():
    """
    Load the AI model when the application starts.
    The model will be stored in the app's state.
    """
    model_path = "app/wound_model_multiclass_finetuned.h5"
    app.state.model = load_model(model_path)
    if app.state.model is None:
        print(f"FATAL: Model from {model_path} could not be loaded.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictResponse(BaseModel):
    """
    Defines the shape of the prediction response.
    Assumes the model outputs a list of probabilities (one for each class).
    """
    filename: str
    content_type: str
    predictions: List[float] 

@app.get("/", include_in_schema=False)
def root() -> dict:
    return {"status": "ok", "docs": "/docs"}

@app.get("/health", response_model=PingResponse)
def health() -> PingResponse:
    return PingResponse()

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