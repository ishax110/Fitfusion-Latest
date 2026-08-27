def calculate_trainer_score(
    completion_rate,
    correct_rep_percentage,
    average_form_score,
    rpe,
    performance_trend
):
    score = 0

    # Completion Score (30)
    score += completion_rate * 30

    # Correct Rep Score (20)
    score += correct_rep_percentage * 20

    # Form Score (25)
    score += (average_form_score / 100) * 25

    # RPE Score (15)
    score += ((10 - rpe) / 9) * 15

    # Performance Trend Score (10)
    trend_score = ((performance_trend + 20) / 40) * 10
    trend_score = max(0, min(10, trend_score))

    score += trend_score

    return round(score, 2)