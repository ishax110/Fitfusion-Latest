# FitFusion AI Service — Python 3.12
FROM python:3.12-slim

WORKDIR /app

# System deps for opencv headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir opencv-python-headless==4.10.0.86 \
 && pip install --no-cache-dir -r requirements.txt

# Copy app source + trained model
COPY app/ ./app/
COPY models/ ./models/

EXPOSE 8000

# Use headless opencv in container (no display)
ENV MPLBACKEND=Agg

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
