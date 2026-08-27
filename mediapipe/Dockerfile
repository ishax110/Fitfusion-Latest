# FitFusion MediaPipe Service — Python 3.11
FROM python:3.11-slim

WORKDIR /app

# System deps for mediapipe + opencv headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libgomp1 libsm6 libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps with correct versions
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir \
    "fastapi==0.115.5" \
    "uvicorn[standard]==0.32.1" \
    "python-multipart==0.0.12" \
    "opencv-python-headless==4.10.0.84" \
    "mediapipe==0.10.21" \
    "numpy==1.26.4"

# Copy app source
COPY app/ ./app/

EXPOSE 8001

ENV PORT=8001
ENV MPLBACKEND=Agg

# Shell form so $PORT expands correctly
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}
