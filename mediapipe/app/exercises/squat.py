import mediapipe as mp

from app.analysis.angle_calculator import AngleCalculator
from app.analysis.posture_analyzer import PostureAnalyzer
from app.analysis.form_analyzer import FormAnalyzer
from app.analysis.rep_counter import RepCounter
from app.analysis.metrics import WorkoutMetrics


class SquatTracker:

    def __init__(self):

        self.pose = mp.solutions.pose

        self.rep_counter = RepCounter()

        self.metrics = WorkoutMetrics()

    def process(self, results):

        if not results.pose_landmarks:
            return

        landmarks = results.pose_landmarks.landmark

        shoulder = (
            landmarks[self.pose.PoseLandmark.LEFT_SHOULDER.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_SHOULDER.value].y
        )

        hip = (
            landmarks[self.pose.PoseLandmark.LEFT_HIP.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_HIP.value].y
        )

        knee = (
            landmarks[self.pose.PoseLandmark.LEFT_KNEE.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_KNEE.value].y
        )

        ankle = (
            landmarks[self.pose.PoseLandmark.LEFT_ANKLE.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_ANKLE.value].y
        )

        knee_angle = AngleCalculator.knee_angle(
            hip,
            knee,
            ankle
        )

        hip_angle = AngleCalculator.hip_angle(
            shoulder,
            hip,
            knee
        )

        back_angle = AngleCalculator.back_angle(
            shoulder,
            hip,
            ankle
        )

        errors = PostureAnalyzer.analyze(
            knee_angle,
            hip_angle,
            back_angle
        )

        score = FormAnalyzer.calculate_score(errors)

        self.metrics.add_score(score)

        self.rep_counter.update(
            angle=knee_angle,
            form_score=score,
            down_threshold=90,
            up_threshold=160
        )

    def get_results(self):

        return self.metrics.generate(
            self.rep_counter.completed_reps,
            self.rep_counter.correct_reps
        )