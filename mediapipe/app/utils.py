import math


def calculate_angle(point1, point2, point3):
    """
    Calculates the angle between three points.

    point2 is the joint.
    """

    x1, y1 = point1
    x2, y2 = point2
    x3, y3 = point3

    angle = math.degrees(
        math.atan2(y3 - y2, x3 - x2)
        -
        math.atan2(y1 - y2, x1 - x2)
    )

    angle = abs(angle)

    if angle > 180:
        angle = 360 - angle

    return angle