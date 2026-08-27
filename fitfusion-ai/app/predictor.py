import joblib
import pandas as pd

model = joblib.load(
    "models/workout_adaptation_model.joblib"
)


def predict_workout(data):

    df = pd.DataFrame([data])

    prediction = model.predict(df)

    return prediction[0]