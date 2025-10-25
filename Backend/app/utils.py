import os
from PIL import Image
from io import BytesIO

def ensure_dirs(path: str):
    os.makedirs(path, exist_ok=True)

def save_bytes(path: str, data: bytes):
    ensure_dirs(os.path.dirname(path))
    with open(path, "wb") as f:
        f.write(data)

def simple_image_prob(image_bytes: bytes) -> float:
    """
    Tiny placeholder heuristic:
    - Convert to grayscale, compute mean brightness.
    - Darker image => higher 'probability'.
    """
    img = Image.open(BytesIO(image_bytes)).convert("L")
    mean = sum(img.getdata()) / (img.width * img.height)
    return max(0.0, min(1.0, (180 - mean) / 180.0))
