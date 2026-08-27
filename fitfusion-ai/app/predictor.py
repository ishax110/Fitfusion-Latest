import os
import joblib
import pandas as pd
from pathlib import Path

# Use absolute path so this works regardless of working directory.
# In Docker: WORKDIR is /app, model is at /app/models/...
# Locally:   model is at fitfusion-ai/models/...
_MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "workout_adaptation_model.joblib"

try:
    model = joblib.load(str(_MODEL_PATH))
except Exception as e:
    raise RuntimeError(
        f"Failed to load ML model from {_MODEL_PATH}: {e}"
    )


def predict_workout(data: dict) -> str:
    df = pd.DataFrame([data])
    prediction = model.predict(df)
    return prediction[0]
