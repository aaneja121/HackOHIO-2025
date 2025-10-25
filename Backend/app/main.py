from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .auth import require_api_key
from .schemas import PingResponse, UploadResponse

# Load variables from Backend/.env if present
load_dotenv()

app = FastAPI()

# CORS for local Next/Vite; keep "*" during hackathon, tighten later.
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

@app.get("/secure", dependencies=[Depends(require_api_key)])
def secure_ping() -> dict:
    return {"ok": True}

@app.post("/upload", response_model=UploadResponse, dependencies=[Depends(require_api_key)])
async def upload(file: UploadFile = File(...)) -> UploadResponse:
    # Accept anything for now; tighten as needed.
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    return UploadResponse(name=file.filename, size=len(data))
