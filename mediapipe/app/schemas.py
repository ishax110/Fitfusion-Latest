from pydantic import BaseModel


class WorkoutRequest(BaseModel):
    exercise: str
    target_reps: int


class WorkoutResponse(BaseModel):
    exercise: str
    completed_reps: int
    correct_reps: int
    average_form_score: float
    completion_rate: float
    status: str