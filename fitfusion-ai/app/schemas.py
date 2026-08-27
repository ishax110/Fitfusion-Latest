from pydantic import BaseModel
from typing import Optional


class WorkoutInput(BaseModel):

    experience_level: str

    current_difficulty: str

    target_reps: int

    completed_reps: int

    completion_rate: float

    correct_rep_percentage: float

    average_form_score: float

    previous_form_score: float

    performance_trend: float

    sessions_completed: int

    rpe: int


class WorkoutGenerateRequest(BaseModel):
    """Request body for AI workout plan generation."""

    goal: str                          # WEIGHT_LOSS | MUSCLE_GAIN | MAINTENANCE | ENDURANCE
    experience_level: str              # BEGINNER | INTERMEDIATE | ADVANCED
    activity_level: str                # SEDENTARY | LIGHTLY_ACTIVE | ...
    age: int
    gender: str                        # MALE | FEMALE
    weight_kg: float
    height_cm: float
    medical_conditions: Optional[str] = None
    preferences: Optional[str] = None  # free text from user
    days_per_week: Optional[int] = 4


class VideoTrackRequest(BaseModel):
    """Metadata sent alongside a video upload."""
    exercise: str        # e.g. "squat", "pushup", "bicep_curl"
    target_reps: int