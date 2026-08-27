def decide_next_difficulty(score):
    if score >= 80:
        return "INCREASE"

    elif score >= 55:
        return "MAINTAIN"

    return "DECREASE"