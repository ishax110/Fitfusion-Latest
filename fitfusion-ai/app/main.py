"""
FitFusion AI Service  (port 8000)
─────────────────────────────────
Endpoints:
  GET  /                  – health check
  POST /predict           – workout adaptation prediction (ML model)
  POST /generate-workout  – Groq LLM personalised workout plan generation
  POST /track-video       – proxies to MediaPipe Service on port 8001

The MediaPipe Service (port 8001) handles all pose detection.
Run it separately:
  cd mediapipe
  venv\\Scripts\\python.exe -m uvicorn app.main:app --port 8001
"""

import os
import httpx

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import WorkoutInput, WorkoutGenerateRequest
from app.predictor import predict_workout
from app.recommendation import build_recommendation
from app.groq_generator import generate_workout_plan

# ── Load .env ─────────────────────────────────────────────────────────────
try:
    from dotenv import load_dotenv
    from pathlib import Path
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


# ── Health check ─────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "FitFusion AI Service v2.0 Running"}


# ── Existing: workout adaptation prediction ───────────────────────────────

@app.post("/predict")
def predict(input: WorkoutInput):
    data   = input.model_dump()
    action = predict_workout(data)
    return build_recommendation(action, data)


# ── NEW: Groq AI workout plan generation ─────────────────────────────────

@app.post("/generate-workout")
def generate_workout(request: WorkoutGenerateRequest):
    """
    Calls Groq LLM with the user's fitness profile to generate
    a full personalised weekly workout plan as JSON.
    """
    try:
        plan = generate_workout_plan(request.model_dump())
        return plan
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Workout generation failed: {e}"
        )


# ── NEW: Video tracking — proxied to MediaPipe Service ───────────────────

@app.post("/track-video")
async def track_video(
    exercise:    str        = Form(...),
    target_reps: int        = Form(...),
    video:       UploadFile = File(...),
):
    """
    Forwards the uploaded video to the MediaPipe Service (port 8001)
    which runs pose detection and returns rep/form metrics.
    """
    video_bytes = await video.read()
    filename    = video.filename or "upload.mp4"
    content_type = video.content_type or "video/mp4"

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{MEDIAPIPE_SERVICE_URL}/track-video",
                data={
                    "exercise":    exercise,
                    "target_reps": str(target_reps),
                },
                files={
                    "video": (filename, video_bytes, content_type),
                },
            )

        if response.status_code == 200:
            return response.json()

        # Forward any error from the mediapipe service
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json().get("detail", "MediaPipe service error")
        )

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=(
                "MediaPipe tracking service is not running. "
                "Start it with: cd mediapipe && "
                "venv\\Scripts\\python.exe -m uvicorn app.main:app --port 8001"
            )
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Video analysis timed out. Try a shorter video."
        )
