"""
FitFusion AI Service (port 8000)
"""

import os
import httpx
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ── Load .env if present ──────────────────────────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

# ── App setup ─────────────────────────────────────────────────────────────
app = FastAPI(title="FitFusion AI Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDIAPIPE_SERVICE_URL = os.getenv(
    "MEDIAPIPE_SERVICE_URL", "http://127.0.0.1:8001"
)

# ── Lazy-load heavy dependencies so startup never crashes ─────────────────
_predictor = None
_recommender = None
_groq_generator = None


def get_predictor():
    global _predictor
    if _predictor is None:
        from app.predictor import predict_workout
        _predictor = predict_workout
    return _predictor


def get_recommender():
    global _recommender
    if _recommender is None:
        from app.recommendation import build_recommendation
        _recommender = build_recommendation
    return _recommender


def get_groq_generator():
    global _groq_generator
    if _groq_generator is None:
        from app.groq_generator import generate_workout_plan
        _groq_generator = generate_workout_plan
    return _groq_generator


# ── Health check — always responds 200, even if model not loaded ──────────

@app.get("/")
def home():
    return {"status": "ok", "message": "FitFusion AI Service v2.0 Running"}


@app.get("/health")
def health():
    return {"status": "ok"}


# ── Workout adaptation prediction ─────────────────────────────────────────

@app.post("/predict")
def predict(input: dict):
    try:
        from app.schemas import WorkoutInput
        validated = WorkoutInput(**input)
        data   = validated.model_dump()
        action = get_predictor()(data)
        return get_recommender()(action, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Groq AI workout plan generation ──────────────────────────────────────

@app.post("/generate-workout")
def generate_workout(request: dict):
    try:
        from app.schemas import WorkoutGenerateRequest
        validated = WorkoutGenerateRequest(**request)
        plan = get_groq_generator()(validated.model_dump())
        return plan
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")


# ── Video tracking proxy to MediaPipe Service ────────────────────────────

@app.post("/track-video")
async def track_video(
    exercise:    str        = Form(...),
    target_reps: int        = Form(...),
    video:       UploadFile = File(...),
):
    video_bytes  = await video.read()
    filename     = video.filename or "upload.mp4"
    content_type = video.content_type or "video/mp4"

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{MEDIAPIPE_SERVICE_URL}/track-video",
                data={"exercise": exercise, "target_reps": str(target_reps)},
                files={"video": (filename, video_bytes, content_type)},
            )
        if response.status_code == 200:
            return response.json()
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json().get("detail", "MediaPipe service error"),
        )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="MediaPipe service is not running.")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Video analysis timed out.")
