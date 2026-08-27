import cv2


class Camera:

    def __init__(self):
        """
        Opens the default webcam.
        """
        self.cap = cv2.VideoCapture(0)

        if not self.cap.isOpened():
            raise Exception("Could not open webcam.")

    def read_frame(self):
        """
        Reads one frame from webcam.
        """

        success, frame = self.cap.read()

        if not success:
            return None

        return frame

    def release(self):
        """
        Releases webcam resources.
        """

        self.cap.release()
        cv2.destroyAllWindows()