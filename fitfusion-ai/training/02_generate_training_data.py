import random
import pandas as pd

from trainer_score import calculate_trainer_score
from trainer_rules import decide_next_difficulty

ROWS = 10000

records = []

for _ in range(ROWS):

    # User Profile
    experience_level = random.choice([
        "BEGINNER",
        "INTERMEDIATE",
        "ADVANCED"
    ])

    current_difficulty = random.choice([
        "EASY",
        "MEDIUM",
        "HARD"
    ])

    # Workout Data
    target_reps = random.randint(8, 15)

    completion_rate = random.uniform(0.50, 1.05)

    completed_reps = round(
        target_reps * completion_rate
    )

    completion_rate = min(
        completed_reps / target_reps,
        1.0
    )

    correct_rep_percentage = random.uniform(
        0.50,
        1.0
    )

    average_form_score = random.uniform(
        50,
        100
    )

    previous_form_score = random.uniform(
        50,
        100
    )

    performance_trend = (
        average_form_score
        - previous_form_score
    )

    sessions_completed = random.randint(
        1,
        50
    )

    rpe = random.randint(1, 10)

    # Trainer Decision Score
    trainer_score_value = calculate_trainer_score(
        completion_rate,
        correct_rep_percentage,
        average_form_score,
        rpe,
        performance_trend
    )

    # Final Label
    next_difficulty_action = decide_next_difficulty(
        trainer_score_value
    )

    # Store Record
    records.append({
        "experience_level": experience_level,
        "current_difficulty": current_difficulty,
        "target_reps": target_reps,
        "completed_reps": completed_reps,
        "completion_rate": completion_rate,
        "correct_rep_percentage": correct_rep_percentage,
        "average_form_score": average_form_score,
        "previous_form_score": previous_form_score,
        "performance_trend": performance_trend,
        "sessions_completed": sessions_completed,
        "rpe": rpe,
        "next_difficulty_action": next_difficulty_action
    })

# Create DataFrame
data = pd.DataFrame(records)

# Save CSV
data.to_csv(
    "data/adaptive_workout_training.csv",
    index=False
)

print("Dataset created successfully.")

print("\nShape:")
print(data.shape)

print("\nFirst 5 rows:")
print(data.head())

print("\nClass distribution:")
print(
    data["next_difficulty_action"].value_counts()
)