import time


class WorkoutMetrics:

    def __init__(self):

        self.start_time = time.time()

        self.form_scores = []

    def add_score(self, score):

        self.form_scores.append(score)

    def generate(self, completed, correct):

        duration = round(time.time() - self.start_time, 2)

        average = 0

        if self.form_scores:
            average = round(
                sum(self.form_scores) /
                len(self.form_scores),
                2
            )

        completion_rate = 0

        if completed != 0:
            completion_rate = round(
                (correct / completed) * 100,
                2
            )

        return {

            "completed_reps": completed,

            "correct_reps": correct,

            "average_form_score": average,

            "completion_rate": completion_rate,

            "workout_duration": duration

        }