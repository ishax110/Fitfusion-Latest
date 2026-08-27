# FitFusion AI Service — Python 3.12
FROM python:3.12-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy app source and model
COPY app/ ./app/
COPY models/ ./models/

EXPOSE 8000

ENV MPLBACKEND=Agg
ENV PORT=8000

# Use shell form so $PORT is expanded correctly
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
