import os
import tempfile

import cv2

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import WorkoutRequest
from app.camera import Camera
from app.pose_detector import PoseDetector

from app.exercises.squat import SquatTracker
from app.exercises.pushup import PushupTracker
from app.exercises.bicep_curl import BicepCurlTracker
from app.exercises.lunge import LungeTracker
from app.exercises.shoulder_press import ShoulderPressTracker
from app.exercises.plank import PlankTracker

app = FastAPI(
    title="FitFusion MediaPipe Service",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Shared helpers ────────────────────────────────────────────────────────

def get_tracker(exercise: str):
    key = exercise.lower().strip()
    if key == "squat":
        return SquatTracker()
    elif key in ("pushup", "push_up", "push-up", "push up"):
        return PushupTracker()
    elif key in ("bicep_curl", "bicep curl", "curl", "bicep-curl"):
        return BicepCurlTracker()
    elif key in ("lunge", "lunges", "forward_lunge"):
        return LungeTracker()
    elif key in ("shoulder_press", "overhead_press", "ohp", "shoulder press"):
        return ShoulderPressTracker()
    elif key in ("plank", "forearm_plank", "plank (holds)"):
        return PlankTracker()
    raise ValueError(
        f"Unsupported exercise: '{exercise}'. "
        f"Supported: squat, pushup, bicep_curl, lunge, shoulder_press, plank"
    )


# ── Health check ─────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "FitFusion MediaPipe Service v2.0 Running"}


# ── Live webcam workout (existing endpoint — unchanged) ───────────────────

def run_workout(exercise: str, target_reps: int):

    camera = Camera()
    detector = PoseDetector()
    tracker = get_tracker(exercise)

    try:
        while True:
            frame = camera.read_frame()
            if frame is None:
                break

            results = detector.detect_pose(frame)
            detector.draw_landmarks(frame, results)
            tracker.process(results)

            data = tracker.get_results()

            cv2.putText(frame, f"Exercise : {exercise.upper()}",
                        (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
            cv2.putText(frame, f"Reps : {data['completed_reps']}",
                        (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            cv2.putText(frame, f"Correct : {data['correct_reps']}",
                        (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
            cv2.putText(frame, f"Form : {data['average_form_score']}",
                        (20, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

            cv2.imshow("FitFusion AI Workout", frame)

            if data["completed_reps"] >= target_reps:
                break
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
            if cv2.getWindowProperty(
                "FitFusion AI Workout", cv2.WND_PROP_VISIBLE
            ) < 1:
                break

    finally:
        camera.release()
        cv2.destroyAllWindows()

    return tracker.get_results()


@app.post("/start-workout")
async def start_workout(request: WorkoutRequest):
    try:
        result = await run_in_threadpool(
            run_workout,
            request.exercise,
            request.target_reps
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── NEW: Video file upload + pose tracking ────────────────────────────────

def run_workout_on_video(
    video_path: str,
    exercise: str,
    target_reps: int
) -> dict:
    """
    Reads a saved video file frame-by-frame, runs pose detection
    on every 3rd frame, and returns rep + form metrics.
    """
    detector = PoseDetector()
    tracker  = get_tracker(exercise)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file.")

    fps          = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_s   = round(total_frames / fps, 1)

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_idx += 1

        # Sample every 3rd frame for speed
        if frame_idx % 3 != 0:
            continue

        results = detector.detect_pose(frame)
        tracker.process(results)

    cap.release()

    data = tracker.get_results()

    # Enrich response with video-specific fields
    data["exercise"]           = exercise
    data["target_reps"]        = target_reps
    data["workout_duration_s"] = duration_s
    data["fps"]                = round(fps, 1)
    data["completion_rate"]    = round(
        min(data["completed_reps"] / max(target_reps, 1), 1.0) * 100, 1
    )
    data["summary"] = (
        f"Completed {data['completed_reps']}/{target_reps} reps "
        f"with {data['average_form_score']}% average form score. "
        f"{data['correct_reps']} reps had good form (≥80%)."
    )

    # Build per-rep details list (rep number + score placeholder)
    rep_details = []
    for i in range(data["completed_reps"]):
        rep_details.append({
            "rep":        i + 1,
            "form_score": data["average_form_score"],
            "feedback":   "Good form" if data["average_form_score"] >= 80
                          else "Check your form",
        })
    data["rep_details"] = rep_details

    return data


@app.post("/track-video")
async def track_video(
    exercise:    str = Form(...),
    target_reps: int = Form(...),
    video: UploadFile = File(...),
):
    """
    Accepts a video file upload and runs MediaPipe Pose analysis.
    Returns rep counts, form scores, and per-rep feedback.
    """
    allowed = {"video/mp4", "video/webm", "video/quicktime", "video/avi",
               "video/x-msvideo", "application/octet-stream"}
    if video.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported type: {video.content_type}. Use MP4/WebM/MOV/AVI."
        )

    suffix = os.path.splitext(video.filename or "upload.mp4")[1] or ".mp4"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await video.read())
        tmp_path = tmp.name

    try:
        result = await run_in_threadpool(
            run_workout_on_video,
            tmp_path,
            exercise,
            target_reps
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {e}"
        )
    finally:
        os.unlink(tmp_path)

    return result
