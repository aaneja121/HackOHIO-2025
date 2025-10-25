from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.config import RISK_WINDOW_DAYS
from app.models_db import Observation, SymptomLog

def compute_risk_for_user(user_id: int, session: Session) -> tuple[int, str]:
    """Combine recent infection prob + symptom urgency into a 0..100 score."""
    since = datetime.utcnow() - timedelta(days=RISK_WINDOW_DAYS)

    obs = session.exec(
        select(Observation).where(Observation.user_id == user_id, Observation.created_at >= since)
    ).all()
    syms = session.exec(
        select(SymptomLog).where(SymptomLog.user_id == user_id, SymptomLog.created_at >= since)
    ).all()

    if not obs and not syms:
        return 5, "No recent data; default low risk."

    p = max((o.prob_score for o in obs), default=0.0)  # worst recent infection prob
    u = max((s.urgency for s in syms), default=0.0)     # worst recent urgency

    # Simple weighted blend; tune freely during demo
    score = int(round(70 * p + 30 * u))
    reason = f"Blended risk from infection_prob={p:.2f} and symptom_urgency={u:.2f}."
    return max(0, min(100, score)), reason
