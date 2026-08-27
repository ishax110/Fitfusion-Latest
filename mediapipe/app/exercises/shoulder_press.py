import mediapipe as mp

from app.analysis.angle_calculator import AngleCalculator
from app.analysis.form_analyzer import FormAnalyzer
from app.analysis.rep_counter import RepCounter
from app.analysis.metrics import WorkoutMetrics


class ShoulderPressTracker:

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
            landmarks[self.pose.PoseLandmark.LEFT_SHOULDER.value].y,
        )

        elbow = (
            landmarks[self.pose.PoseLandmark.LEFT_ELBOW.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_ELBOW.value].y,
        )

        wrist = (
            landmarks[self.pose.PoseLandmark.LEFT_WRIST.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_WRIST.value].y,
        )

        hip = (
            landmarks[self.pose.PoseLandmark.LEFT_HIP.value].x,
            landmarks[self.pose.PoseLandmark.LEFT_HIP.value].y,
        )

        elbow_angle = AngleCalculator.calculate_angle(shoulder, elbow, wrist)
        back_angle = AngleCalculator.back_angle(shoulder, hip, wrist)

        score = FormAnalyzer.calculate_shoulder_press_score(elbow_angle, back_angle)

        self.metrics.add_score(score)

        # Press: elbow extends from ~90° (down/start) to ~160°+ (up/lockout)
        self.rep_counter.update(
            angle=elbow_angle,
            form_score=score,
            down_threshold=100,
            up_threshold=155,
        )

    def get_results(self):
        return self.metrics.generate(
            self.rep_counter.completed_reps,
            self.rep_counter.correct_reps,
        )
