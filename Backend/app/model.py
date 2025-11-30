import tensorflow as tf
import numpy as np
from PIL import Image
from io import BytesIOTARGET_SIZE = (224, 224) 

def load_model(model_path: str):
    """
    Loads the Keras .h5 model file.
    """
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"Successfully loaded model from {model_path}")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocesses the raw image bytes for model prediction.
    
    1. Opens the image
    2. Converts to RGB (if not already)
    3. Resizes to the model's target size
    4. Converts to a NumPy array
    5. Normalizes pixel values (scales from 0-255 to 0-1)
    6. Adds a "batch" dimension
    
    You may need to adjust this (e.g., normalization)
    to match the *exact* preprocessing your model was trained with.
    """
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = img.resize(TARGET_SIZE)
    
    img_array = np.array(img)
    
    normalized_array = img_array / 255.0
    
    batch_array = np.expand_dims(normalized_array, axis=0)
    
    return batch_array