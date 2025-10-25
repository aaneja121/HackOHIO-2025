# 1) clone/cd into aegis-backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
# visit http://127.0.0.1:8000/docs
