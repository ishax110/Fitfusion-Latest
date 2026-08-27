class FormAnalyzer:

    @staticmethod
    def calculate_score(errors):

        score = 100

        deductions = {
            "Squat depth too shallow": 25,
            "Hip not lowered enough": 20,
            "Leaning forward": 15
        }

        for error in errors:
            score -= deductions.get(error, 10)

        return max(score, 0)

    @staticmethod
    def calculate_pushup_score(elbow_angle):

        score = 100

        if elbow_angle > 170:
            score -= 20

        elif elbow_angle > 160:
            score -= 10

        elif elbow_angle < 70:
            score -= 10

        return max(score, 0)

    @staticmethod
    def calculate_bicep_curl_score(elbow_angle):

        score = 100

        if elbow_angle > 160:
            score -= 20

        elif elbow_angle > 150:
            score -= 10

        elif elbow_angle < 30:
            score -= 10

        return max(score, 0)

    @staticmethod
    def calculate_lunge_score(knee_angle, torso_angle):
        """Score a lunge rep based on knee depth and torso uprightness."""
        score = 100

        # Front knee should reach ~90°; penalise if too shallow
        if knee_angle > 120:
            score -= 25  # barely bent
        elif knee_angle > 110:
            score -= 15

        # Torso should stay upright (angle close to 180°)
        if torso_angle < 70:
            score -= 20  # leaning too far forward
        elif torso_angle < 85:
            score -= 10

        return max(score, 0)

    @staticmethod
    def calculate_shoulder_press_score(elbow_angle, back_angle):
        """Score a shoulder press based on lockout and back arch."""
        score = 100

        # Penalise incomplete lockout at the top
        if elbow_angle < 140:
            score -= 20
        elif elbow_angle < 150:
            score -= 10

        # Penalise excessive lower-back arch
        if back_angle < 160:
            score -= 20
        elif back_angle < 170:
            score -= 10

        return max(score, 0)

    @staticmethod
    def calculate_plank_score(body_angle):
        """
        Score a plank hold frame based on body alignment.
        Ideal body angle (shoulder-hip-ankle) ≈ 180°.
        """
        score = 100

        deviation = abs(180 - body_angle)

        if deviation > 20:
            score -= 30   # hips too high or sagging badly
        elif deviation > 12:
            score -= 20
        elif deviation > 6:
            score -= 10

        return max(score, 0)
