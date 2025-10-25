import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY", "demo-key-123")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aegis.db")
MODEL_PATH = os.getenv("MODEL_PATH", "./models/wound_cnn.h5")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./storage/uploads")
RISK_WINDOW_DAYS = int(os.getenv("RISK_WINDOW_DAYS", "3"))
