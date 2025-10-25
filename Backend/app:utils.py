import os
from pathlib import Path
from app.config import UPLOAD_DIR

Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

def save_upload(file, filename_hint: str) -> str:
    suffix = Path(filename_hint).suffix or ".jpg"
    path = Path(UPLOAD_DIR) / filename_hint
    with open(path, "wb") as f:
        f.write(file)
    return str(path)
