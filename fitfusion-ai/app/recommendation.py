def build_recommendation(action, input_data):

    difficulty = input_data["current_difficulty"]

    sets = 3
    reps = input_data["target_reps"]

    if action == "INCREASE":

        if difficulty == "EASY":
            difficulty = "MEDIUM"

        elif difficulty == "MEDIUM":
            difficulty = "HARD"

        else:
            sets += 1

        reason = (
            "Excellent workout performance. "
            "Increasing workout difficulty."
        )

    elif action == "DECREASE":

        if difficulty == "HARD":
            difficulty = "MEDIUM"

        elif difficulty == "MEDIUM":
            difficulty = "EASY"

        else:
            sets = max(2, sets - 1)

        reason = (
            "Workout performance indicates fatigue "
            "or poor execution."
        )

    else:

        reason = (
            "Current workout difficulty is appropriate."
        )

    return {
        "next_difficulty_action": action,
        "recommended_sets": sets,
        "recommended_reps": reps,
        "difficulty": difficulty,
        "reason": reason
    }