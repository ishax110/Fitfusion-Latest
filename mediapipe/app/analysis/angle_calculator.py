from app.utils import calculate_angle


class AngleCalculator:

    @staticmethod
    def calculate_angle(a, b, c):
        """Generic angle at vertex b formed by points a-b-c."""
        return calculate_angle(a, b, c)

    @staticmethod
    def knee_angle(hip, knee, ankle):
        return calculate_angle(hip, knee, ankle)

    @staticmethod
    def hip_angle(shoulder, hip, knee):
        return calculate_angle(shoulder, hip, knee)

    @staticmethod
    def back_angle(shoulder, hip, ankle):
        return calculate_angle(shoulder, hip, ankle)

    @staticmethod
    def elbow_angle(shoulder, elbow, wrist):
        return calculate_angle(shoulder, elbow, wrist)