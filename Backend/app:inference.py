import os
from typing import Tuple
import numpy as np
from PIL import Image
from app.config import MODEL_PATH

MODEL = None
USE_TF = False

def _try_load_tf():
    """Attempt to load a Keras model lazily; if TF isn't installed, fall back."""
    global MODEL, USE_TF
    if os.path.exists(MODEL_PATH):
        try:
            import tensorflow as tf  # optional; not required for MVP
            MODEL = tf.keras.models.load_model(MODEL_PATH)
            USE_TF = True
        except Exception:
            MODEL, USE_TF = None, False

_try_load_tf()

def preprocess_image(image_path: str) -> np.ndarray:
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    arr = np.asarray(img, dtype=np.float32)
    arr = (arr / 127.5) - 1.0  # MobileNetV2 normalization → [-1, 1]
    return np.expand_dims(arr, axis=0)

def infer_infection_prob(image_path: str) -> float:
    """Return probability 0..1 of infection. Uses TF model if available; otherwise a redness heuristic."""
    if USE_TF and MODEL is not None:
        x = preprocess_image(image_path)
        prob = float(MODEL.predict(x, verbose=0).squeeze())
        return float(np.clip(prob, 0.0, 1.0))

    # Heuristic fallback: relative redness
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    arr = np.asarray(img).astype(np.float32) + 1e-6
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    redness = np.mean(r / (g + b))
    prob = (redness - 0.9) / 0.6  # scale ~0..1
    return float(np.clip(prob, 0.0, 1.0))

def label_from_prob(p: float, threshold: float = 0.5) -> Tuple[str, str]:
    label = "infected" if p >= threshold else "healthy"
    status = "Warning: Potential Infection Detected" if label == "infected" else "Healthy"
    return status, label
