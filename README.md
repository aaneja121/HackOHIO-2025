# Healios - AI Post-Surgical Recovery Assistant

Healios is a full-stack application designed to assist patients in monitoring their post-surgical wound recovery using AI. Patients can upload photos of their wounds, and the application provides an AI-driven analysis of the wound's condition and risk level.

This repository contains the complete project, including a Python-based backend and a React-based frontend.

## Project Structure

* `/Frontend`: Contains the patient-facing web application built with React and Next.js (App Router).
* `/Backend`: Contains the Python API server built with FastAPI, which serves the AI/ML model.

---

## Technologies Used

**Frontend:**
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (with Glassmorphism and animations)
* **UI Components:** shadcn-ui
* **Icons:** Lucide React

**Backend:**
* **Framework:** FastAPI
* **Server:** Uvicorn
* **ML/AI:** TensorFlow
* **Data Validation:** Pydantic
* **Image Processing:** Pillow (PIL)

---

## Getting Started

### Prerequisites

* Node.js (v18 or later)
* Python (v3.10 or later) & `pip`
* A virtual environment tool (like `venv`)

### AI Model Configuration

**Model & Preprocessing**
* **Model File:** The backend loads a TensorFlow/Keras model from `Backend/app/wound_model_multiclass_finetuned.h5`. This model was created by training a deep learning network using Google Colab and TensorFlow.
* **Image Preprocessing:** Before prediction, all uploaded images are automatically resized to (224, 224) pixels, converted to RGB, and normalized to a 0-1 scale.

### Prediction Classes

The model is a multi-class classifier. The predictions array returned by the API corresponds to the following 10 classes, which are interpreted by the frontend:

`Abrasions, Bruises, Burns, Cut, Diabetic Wounds, Laceration, Normal, Pressure Wounds, Surgical Wounds, Venous Wounds`

The frontend logic in `WoundUpload.tsx` maps these classes to a "Healthy", "Warning", or "Critical" status, generates an AI diagnosis, and provides actionable recommendations.

### License
This project is licensed under the MIT License.
