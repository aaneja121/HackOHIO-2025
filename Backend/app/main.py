import os
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from dotenv import load_dotenv

from app.schemas import (
    LoginIn, LoginOut, SymptomIn, SymptomOut, AssessOut, RiskOut
)
from app.auth import require_api_key
from app.db import (
    init_db, get_session, get_or_create_user,
    User, Observation, SymptomLog, RiskScore
)
from app.utils import ensure_dirs, save_bytes, simple_image_prob

load_dotenv()

app = FastAPI(title="Aegis Lite API", version="0.1.0")

# Allow your local Next.js dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_DIR = os.getenv("STORAGE_DIR", "storage/uploads")
ensure_dirs(STORAGE_DIR)

@app.on_event("startup")
def _startup():
    init_db()

@app.post("/auth/login", response_model=LoginOut)
def login(body: LoginIn, session=Depends(get_session)):
    get_or_create_user(session, body.external_id, body.display_name)
    return LoginOut(api_key=os.getenv("API_KEY_DEMO", "demo-key-123"))

@app.post(
    "/wounds/assess",
    response_model=AssessOut,
    dependencies=[Depends(require_api_key)]
)
async def assess_wound(
    user_external_id: str = Query(...),
    file: UploadFile = File(...),
    session=Depends(get_session)
):
    user = session.exec(select(User).where(User.external_id == user_external_id)).first()
    if not user:
        raise HTTPException(400, "Unknown user_external_id")

    data = await file.read()
    prob = simple_image_prob(data)
    label = "infected" if prob >= 0.5 else "healthy"

    rel = f"{user_external_id}/{file.filename or 'upload.jpg'}"
    abs_p = os.path.join(STORAGE_DIR, rel)
    save_bytes(abs_p, data)

    session.add(Observation(user_id=user.id, image_path=rel, prob_score=prob, label=label))
    session.commit()

    status_msg = "Warning: Potential Infection Detected" if label == "infected" else "Status: Healthy"
    return AssessOut(status=status_msg, probability=prob, label=label)

@app.post(
    "/symptoms",
    response_model=SymptomOut,
    dependencies=[Depends(require_api_key)]
)
def log_symptom(
    body: SymptomIn,
    user_external_id: str = Query(...),
    session=Depends(get_session)
):
    user = session.exec(select(User).where(User.external_id == user_external_id)).first()
    if not user:
        raise HTTPException(400, "Unknown user_external_id")

    text = body.text.lower()
    weights = {"throbbing": 0.7, "dizzy": 0.6, "fever": 0.8, "pus": 0.9, "redness": 0.5, "pain": 0.5}
    urgency = max([w for k, w in weights.items() if k in text] + [0.2])

    session.add(SymptomLog(user_id=user.id, free_text=body.text, urgency=urgency))
    session.commit()

    return SymptomOut(urgency=urgency)

@app.get(
    "/patients/{external_id}/risk",
    response_model=RiskOut,
    dependencies=[Depends(require_api_key)]
)
def risk(external_id: str, session=Depends(get_session)):
    user = session.exec(select(User).where(User.external_id == external_id)).first()
    if not user:
        raise HTTPException(404, "User not found")

    last_ob = session.exec(
        select(Observation)
        .where(Observation.user_id == user.id)
        .order_by(Observation.created_at.desc())
    ).first()
    prob = last_ob.prob_score if last_ob else 0.25

    last_sym = session.exec(
        select(SymptomLog)
        .where(SymptomLog.user_id == user.id)
        .order_by(SymptomLog.created_at.desc())
    ).first()
    urg = last_sym.urgency if last_sym else 0.2

    score = int(round(100 * (0.65 * prob + 0.35 * urg)))
    reason = f"Blend of wound prob={prob:.2f} & symptom urgency={urg:.2f}"

    session.add(RiskScore(user_id=user.id, score_0_100=score, reason=reason))
    session.commit()

    return RiskOut(risk=score, reason=reason)
