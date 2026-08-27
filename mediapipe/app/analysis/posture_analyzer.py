class PostureAnalyzer:

    @staticmethod
    def analyze(knee_angle, hip_angle, back_angle):

        errors = []

        if knee_angle > 100:
            errors.append("Squat depth too shallow")

        if hip_angle < 60:
            errors.append("Hip not lowered enough")

        if back_angle < 150:
            errors.append("Leaning forward")

        return errors