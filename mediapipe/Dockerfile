# FitFusion MediaPipe Service — Python 3.12
FROM python:3.12-slim

WORKDIR /app

# System deps for mediapipe + opencv (headless, no display)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libgomp1 libsm6 libxext6 libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps — use headless opencv
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir opencv-python-headless==5.0.0.86 \
 && grep -v "opencv" requirements.txt | pip install --no-cache-dir -f /dev/stdin || true \
 && pip install --no-cache-dir fastapi uvicorn[standard] python-multipart mediapipe==0.10.21

# Copy app source
COPY app/ ./app/

EXPOSE 8001

ENV MPLBACKEND=Agg

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
