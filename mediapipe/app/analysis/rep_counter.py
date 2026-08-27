class RepCounter:

    def __init__(self):

        self.stage = "UP"

        self.completed_reps = 0

        self.correct_reps = 0

    def update(self, angle, form_score, down_threshold, up_threshold):

        completed = False

        if angle > up_threshold:
            self.stage = "UP"

        if angle < down_threshold and self.stage == "UP":

            self.stage = "DOWN"

            self.completed_reps += 1

            completed = True

            if form_score >= 80:
                self.correct_reps += 1

        return completed

    def completion_rate(self):

        if self.completed_reps == 0:
            return 0

        return round(
            (self.correct_reps / self.completed_reps) * 100,
            2
        )