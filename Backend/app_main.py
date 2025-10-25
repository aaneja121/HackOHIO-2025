from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException, Body, Query
from sqlmodel import Session, select
from app.db import init_db, get_session
from app.auth import require_api_key
from app import schemas
from app.models_db import User, Observation, SymptomLog, RiskScore
from app.utils import save_upload
from app.inference import infer_infection_prob, label_from_prob
from app.risk import compute_risk_for_user


app = FastAPI(title="Aegis Backend", version="0.1.0")

@app.on_event("startup")
def _startup():
    init_db()

@app.post("/auth/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.external_id == payload.external_id)).first()
    if not user:
        user = User(external_id=payload.external_id, display_name=payload.display_name)
        session.add(user)
        session.commit()
    return schemas.LoginResponse(api_key="demo-key-123")

@app.get("/checklist/today", dependencies=[Depends(require_api_key)])
def checklist():
    return {
        "date": "today",
        "items": [
            {"id": "photo", "text": "Take photo of wound", "required": True},
            {"id": "symptom", "text": "Describe how you feel", "required": True},
            {"id": "meds", "text": "Confirm medication taken", "required": False},
        ],
    }

@app.post("/wounds/assess", response_model=schemas.InferenceOut, dependencies=[Depends(require_api_key)])
async def assess_wound(
    user_external_id: str = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.external_id == user_external_id)).first()
    if not user:
        raise HTTPException(400, "Unknown user_external_id")

    content = await file.read()
    image_path = save_upload(content, filename_hint=f"user{user.id}_{file.filename or 'wound.jpg'}")

    prob = infer_infection_prob(image_path)
    status, label = label_from_prob(prob)

    # CHANGED: prob_score field name
    ob = Observation(user_id=user.id, image_path=image_path, prob_score=prob, label=label)
    session.add(ob)
    session.commit()

    return {"status": "Healthy" if label == "healthy" else "Warning: Potential Infection Detected",
            "probability": prob,
            "label": label}

@app.post("/symptoms", response_model=schemas.SymptomOut, dependencies=[Depends(require_api_key)])
async def log_symptom(
    payload: schemas.SymptomIn = Body(...),   # JSON body: {"text": "..."}
    user_external_id: str = Query(...),       # query: ?user_external_id=...
    session: Session = Depends(get_session),
):
    ...
    user = session.exec(select(User).where(User.external_id == user_external_id)).first()
    if not user:
        raise HTTPException(400, "Unknown user_external_id")

    text = payload.text.lower()
    keywords = {"throbbing": 0.7, "dizzy": 0.6, "fever": 0.8, "pus": 0.9, "redness": 0.5, "pain": 0.5}
    urgency = max([w for k, w in keywords.items() if k in text] + [0.2])

    s = SymptomLog(user_id=user.id, free_text=payload.text, urgency=urgency)
    session.add(s)
    session.commit()
    return {"urgency": urgency}

@app.post("/symptoms2", response_model=schemas.SymptomOut, dependencies=[Depends(require_api_key)])
async def log_symptom_v2(
    payload: schemas.SymptomIn = Body(...),     # JSON body: {"text": "..."}
    user_external_id: str = Query(...),         # query param: ?user_external_id=...
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.external_id == user_external_id)).first()
    if not user:
        raise HTTPException(400, "Unknown user_external_id")

    text = payload.text.lower()
    keywords = {"throbbing": 0.7, "dizzy": 0.6, "fever": 0.8, "pus": 0.9, "redness": 0.5, "pain": 0.5}
    urgency = max([w for k, w in keywords.items() if k in text] + [0.2])

    s = SymptomLog(user_id=user.id, free_text=payload.text, urgency=urgency)
    session.add(s); session.commit()
    return {"urgency": urgency}

@app.get("/patients/{external_id}/risk", response_model=schemas.RiskOut, dependencies=[Depends(require_api_key)])
def get_risk(external_id: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.external_id == external_id)).first()
    if not user:
        raise HTTPException(404, "User not found")
    risk, reason = compute_risk_for_user(user.id, session)
    rs = RiskScore(user_id=user.id, score_0_100=risk, reason=reason)
    session.add(rs)
    session.commit()
    return {"risk": risk, "reason": reason}
