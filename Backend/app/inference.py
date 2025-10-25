import os
import numpy as np
from PIL import Image
from app.config import MODEL_PATH
from typing import Tuple

MODEL = None
USE_TF = False

def _try_load_tf():
    global MODEL, USE_TF
    if os.path.exists(MODEL_PATH):
        try:
            import tensorflow as tf
            from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
            MODEL = tf.keras.models.load_model(MODEL_PATH)
            USE_TF = True
        except Exception:
            MODEL, USE_TF = None, False

_try_load_tf()

def preprocess_image(image_path: str) -> np.ndarray:
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    arr = np.asarray(img, dtype=np.float32)
    # MobileNetV2 preprocess: scale to [-1,1]
    arr = (arr / 127.5) - 1.0
    arr = np.expand_dims(arr, axis=0)
    return arr

def infer_infection_prob(image_path: str) -> float:
    """Return probability 0..1 of infection."""
    x = preprocess_image(image_path)

    if USE_TF and MODEL is not None:
        prob = float(MODEL.predict(x, verbose=0).squeeze())
        return max(0.0, min(1.0, prob))

    # Fallback heuristic (for live demo before model is ready):
    # More “red channel dominance” → higher infection probability.
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    arr = np.asarray(img).astype(np.float32) + 1e-6
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    redness = np.mean(r / (g + b))
    prob = (redness - 0.9) / 0.6  # scale roughly into 0..1
    return float(np.clip(prob, 0.0, 1.0))

def label_from_prob(p: float, threshold: float = 0.5) -> Tuple[str, str]:
    label = "infected" if p >= threshold else "healthy"
    status = "Warning: Potential Infection Detected" if label == "infected" else "Healthy"
    return status, label
