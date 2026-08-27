import mediapipe as mp

from app.analysis.angle_calculator import AngleCalculator
from app.analysis.form_analyzer import FormAnalyzer
from app.analysis.metrics import WorkoutMetrics


class PlankTracker:
    """
    Plank is a static hold, not a rep exercise.
    Every ~10 processed frames (≈1 second of video) is treated
    as one "hold second".  Form score is only recorded at each
    second boundary — not on every frame — so the average
    reflects per-second quality rather than per-frame noise.
    """

    def __init__(self):
        self.pose    = mp.solutions.pose
        self.metrics = WorkoutMetrics()

        self._total_frames   = 0   # frames processed so far
        self._second_scores  = []  # one entry per second
        self._current_scores = []  # accumulated within the current second
        self._hold_seconds   = 0
        self._correct_seconds = 0

    def process(self, results):

        if not results.pose_landmarks:
            return

        landmarks = results.pose_landmarks.landmark
        PL = self.pose.PoseLandmark

        shoulder = (
            landmarks[PL.LEFT_SHOULDER.value].x,
            landmarks[PL.LEFT_SHOULDER.value].y,
        )
        hip = (
            landmarks[PL.LEFT_HIP.value].x,
            landmarks[PL.LEFT_HIP.value].y,
        )
        ankle = (
            landmarks[PL.LEFT_ANKLE.value].x,
            landmarks[PL.LEFT_ANKLE.value].y,
        )

        body_angle = AngleCalculator.back_angle(shoulder, hip, ankle)
        frame_score = FormAnalyzer.calculate_plank_score(body_angle)

        # Accumulate per-second score bucket
        self._current_scores.append(frame_score)
        self._total_frames += 1

        # Every ~10 processed frames = ~1 second (video sampled every 3rd frame
        # at 30fps means ~10 processed frames per second)
        if self._total_frames % 10 == 0 and self._current_scores:
            second_avg = round(
                sum(self._current_scores) / len(self._current_scores), 1
            )
            self._second_scores.append(second_avg)
            self._current_scores = []

            self._hold_seconds += 1
            if second_avg >= 80:
                self._correct_seconds += 1

            # Record this second in WorkoutMetrics so generate() works correctly
            self.metrics.add_score(second_avg)

    def get_results(self):
        # Flush any remaining partial second
        if self._current_scores and len(self._current_scores) >= 5:
            partial_avg = round(
                sum(self._current_scores) / len(self._current_scores), 1
            )
            self._second_scores.append(partial_avg)
            self._hold_seconds += 1
            if partial_avg >= 80:
                self._correct_seconds += 1
            self.metrics.add_score(partial_avg)
            self._current_scores = []

        base = self.metrics.generate(
            self._hold_seconds,
            self._correct_seconds,
        )
        base["hold_seconds"] = self._hold_seconds
        return base
