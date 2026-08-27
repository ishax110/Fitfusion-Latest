import mediapipe as mp

from app.analysis.angle_calculator import AngleCalculator
from app.analysis.form_analyzer import FormAnalyzer
from app.analysis.rep_counter import RepCounter
from app.analysis.metrics import WorkoutMetrics


class LungeTracker:

    def __init__(self):

        self.pose = mp.solutions.pose
        self.rep_counter = RepCounter()
        self.metrics = WorkoutMetrics()

    def process(self, results):

        if not results.pose_landmarks:
            return

        landmarks = results.pose_landmarks.landmark

        hip = (
            landmarks[self.pose.PoseLandmark.LEFT_HIP.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_HIP.value].y,
        )

        knee = (
            landmarks[self.pose.PoseLandmark.LEFT_KNEE.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_KNEE.value].y,
        )

        ankle = (
            landmarks[self.pose.PoseLandmark.LEFT_ANKLE.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_ANKLE.value].y,
        )

        shoulder = (
            landmarks[self.pose.PoseLandmark.LEFT_SHOULDER.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_SHOULDER.value].y,
        )

        knee_angle = AngleCalculator.knee_angle(hip, knee, ankle)
        torso_angle = AngleCalculator.hip_angle(shoulder, hip, knee)

        score = FormAnalyzer.calculate_lunge_score(knee_angle, torso_angle)

        self.metrics.add_score(score)

        # Lunge: front knee bends to ~90° (down) then extends back up (up)
        self.rep_counter.update(
            angle=knee_angle,
            form_score=score,
            down_threshold=100,
            up_threshold=155,
        )

    def get_results(self):
        return self.metrics.generate(
            self.rep_counter.completed_reps,
            self.rep_counter.correct_reps,
        )
