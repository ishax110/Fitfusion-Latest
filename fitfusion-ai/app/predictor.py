import joblib
import pandas as pd
from pathlib import Path

_MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "workout_adaptation_model.joblib"
_model = None


def _get_model():
    global _model
    if _model is None:
        if not _MODEL_PATH.exists():
            raise RuntimeError(f"Model file not found at {_MODEL_PATH}")
        _model = joblib.load(str(_MODEL_PATH))
    return _model


def predict_workout(data: dict) -> str:
    model = _get_model()
    df = pd.DataFrame([data])
    return model.predict(df)[0]
