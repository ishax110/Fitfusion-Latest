import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    classification_report
)
from sklearn.metrics import confusion_matrix
import joblib
import os


data = pd.read_csv(
    "data/adaptive_workout_training.csv"
)

print(data.head())
print(data.shape)



X = data.drop(
    columns=["next_difficulty_action"]
)

y = data["next_difficulty_action"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# separating categorical and numerical values

categorical_features = [
    "experience_level",
    "current_difficulty"
]

numerical_features = [
    "target_reps",
    "completed_reps",
    "completion_rate",
    "correct_rep_percentage",
    "average_form_score",
    "previous_form_score",
    "performance_trend",
    "sessions_completed",
    "rpe"
]


categorical_transformer = OneHotEncoder(
    handle_unknown="ignore"
)



preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            categorical_transformer,
            categorical_features
        ),
        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)



X_train_processed = preprocessor.fit_transform(
    X_train
)


random_forest = RandomForestClassifier(
    n_estimators=100, #100 decision trees
    random_state=42
)

model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", random_forest)
    ]
)

model.fit(
    X_train,
    y_train
)


predictions = model.predict(X_test)

print("\nFIRST 10 PREDICTIONS:")
print(predictions[:10])

print("\nFIRST 10 ACTUAL VALUES:")
print(y_test.head(10).values)



accuracy = accuracy_score(
    y_test,
    predictions
)

print("\nMODEL ACCURACY:")
print(round(accuracy * 100, 2), "%")



print("\nCLASSIFICATION REPORT:")

print(
    classification_report(
        y_test,
        predictions
    )
)



os.makedirs("models", exist_ok=True)

joblib.dump(
    model,
    "models/workout_adaptation_model.joblib"
)

print("\nModel saved successfully!")

