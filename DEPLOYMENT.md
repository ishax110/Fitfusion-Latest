# FitFusion — Deployment Guide

## Platform: Railway (Recommended)

Railway is the best choice for FitFusion because:
- Manages all 5 services (4 app + 1 database) in one project
- Built-in managed PostgreSQL
- Auto-provisions HTTPS for every service
- $5/month free credit — enough for a demo
- No DevOps experience required

---

## Architecture Overview

```
Browser
   │
   ▼
Frontend (React/Nginx) ──────────────────────────────────────────────────────┐
   │                                                                          │
   ▼ VITE_API_BASE_URL                                                        │
Spring Boot Backend (:8080)                                                   │
   │            │                                                             │
   │            ▼ AI_SERVICE_URL                                              │
   │       FastAPI AI Service (:8000)                                         │
   │            │                                                             │
   │            ▼ MEDIAPIPE_SERVICE_URL                                       │
   │       MediaPipe Service (:8001)                                          │
   │                                                                          │
   ▼ DB_URL                                                                   │
PostgreSQL Database                                                           │
                                                                              │
Browser also calls MediaPipe CDN directly for live camera pose detection ─────┘
```

---

## Option A — Deploy to Railway (Cloud)

### Prerequisites
- GitHub account
- Railway account (free) — https://railway.app
- Groq API key — https://console.groq.com/keys

### Step 1 — Push code to GitHub

```bash
cd c:\Users\acer\Desktop\fitfusion-backup

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit — FitFusion"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/fitfusion.git
git push -u origin main
```

### Step 2 — Create Railway project

1. Go to https://railway.app → **New Project**
2. Choose **Deploy from GitHub repo** → select your repo
3. Railway will detect the root `railway.toml`

### Step 3 — Add PostgreSQL

1. In your Railway project → **New Service** → **Database** → **PostgreSQL**
2. Railway auto-provisions it and gives you a `DATABASE_URL`

### Step 4 — Deploy each service

Railway needs 5 separate services. For each one:

**In Railway dashboard → New Service → GitHub Repo → select subfolder:**

| Service Name | Root Directory | Port |
|---|---|---|
| `fitfusion-backend` | `/fitfusion-backend` | 8080 |
| `fitfusion-ai` | `/fitfusion-ai` | 8000 |
| `fitfusion-mediapipe` | `/mediapipe` | 8001 |
| `fitfusion-frontend` | `/fitfusion-frontend` | 80 |

### Step 5 — Set environment variables

**fitfusion-backend service:**
```
DB_URL              = ${{Postgres.DATABASE_URL}}
DB_USERNAME         = ${{Postgres.PGUSER}}
DB_PASSWORD         = ${{Postgres.PGPASSWORD}}
JWT_SECRET          = <generate: openssl rand -base64 64>
AI_SERVICE_URL      = https://<fitfusion-ai>.railway.app
ALLOWED_ORIGINS     = https://<fitfusion-frontend>.railway.app
```

**fitfusion-ai service:**
```
GROQ_API_KEY           = gsk_your_key_here
MEDIAPIPE_SERVICE_URL  = https://<fitfusion-mediapipe>.railway.app
```

**fitfusion-frontend service (build args):**
```
VITE_API_BASE_URL = https://<fitfusion-backend>.railway.app
```

### Step 6 — Deploy order

Deploy in this order (each must be healthy before the next):
1. PostgreSQL (auto-managed)
2. fitfusion-mediapipe
3. fitfusion-ai
4. fitfusion-backend
5. fitfusion-frontend

### Step 7 — Get your URLs

After deployment, Railway gives each service a URL like:
- Frontend: `https://fitfusion-frontend.railway.app`
- Backend: `https://fitfusion-backend.railway.app`

Open the frontend URL in your browser — FitFusion is live!

---

## Option B — Docker Compose (Local / Any VPS)

### Prerequisites
- Docker Desktop installed
- Docker Compose v2+

### Setup

```bash
# 1. Copy env template
cp .env.example .env

# 2. Edit .env — fill in these required values:
#    POSTGRES_PASSWORD  — any strong password
#    JWT_SECRET         — run: openssl rand -base64 64
#    GROQ_API_KEY       — from https://console.groq.com/keys

# 3. Build and start all services
docker-compose up --build

# 4. Open browser
#    http://localhost:3000
```

### Stop all services
```bash
docker-compose down

# To also delete the database volume:
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Single service
docker-compose logs -f backend
docker-compose logs -f ai-service
```

---

## Option C — Deploy to a VPS (DigitalOcean / Linode / Contabo)

### Recommended specs
- 4 GB RAM minimum (MediaPipe is memory-intensive)
- 2 vCPUs
- 40 GB SSD

### Steps

```bash
# 1. SSH into your VPS
ssh root@YOUR_VPS_IP

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone your repo
git clone https://github.com/YOUR_USERNAME/fitfusion.git
cd fitfusion

# 4. Set up environment
cp .env.example .env
nano .env   # fill in the values

# 5. Start everything
docker-compose up -d --build

# 6. Set up Nginx reverse proxy (optional — for custom domain)
apt install nginx certbot python3-certbot-nginx
```

---

## Security Checklist Before Deploying

- [ ] `JWT_SECRET` is a random string of at least 64 characters
- [ ] `POSTGRES_PASSWORD` is not the default `1234`
- [ ] `GROQ_API_KEY` is set as an environment variable, not in code
- [ ] `.env` is in `.gitignore` (already done)
- [ ] `ALLOWED_ORIGINS` only contains your actual frontend domain

### Generate a strong JWT secret (run in terminal):

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```

**Linux/Mac:**
```bash
openssl rand -base64 64
```

---

## Environment Variables Reference

| Variable | Service | Required | Default | Description |
|---|---|---|---|---|
| `DB_URL` | Backend | Yes | localhost:5432 | PostgreSQL JDBC URL |
| `DB_USERNAME` | Backend | Yes | postgres | Database user |
| `DB_PASSWORD` | Backend | Yes | 1234 | Database password |
| `JWT_SECRET` | Backend | Yes | weak default | JWT signing secret (min 32 chars) |
| `AI_SERVICE_URL` | Backend | Yes | localhost:8000 | FastAPI AI service URL |
| `ALLOWED_ORIGINS` | Backend | Yes | localhost:5173 | CORS allowed origins |
| `GROQ_API_KEY` | AI Service | Yes | — | Groq LLM API key |
| `MEDIAPIPE_SERVICE_URL` | AI Service | Yes | localhost:8001 | MediaPipe service URL |
| `VITE_API_BASE_URL` | Frontend | Yes | localhost:8080 | Backend API base URL |
| `PORT` | All services | Railway | 8080/8000/8001 | Auto-set by Railway |

---

## Troubleshooting

### Backend won't connect to database
```
Error: Connection refused to localhost:5432
```
Fix: Set `DB_URL` to point to the actual database host, not `localhost`.
In Docker: use `postgres` (the service name). In Railway: use `${{Postgres.DATABASE_URL}}`.

### AI service can't reach MediaPipe
```
MediaPipe tracking service is not running
```
Fix: Set `MEDIAPIPE_SERVICE_URL` to the actual MediaPipe service URL/hostname.

### Frontend shows "Cannot connect to server"
Fix: Set `VITE_API_BASE_URL` to your deployed backend URL. This must be set at **build time** for React/Vite.

### CORS errors in browser console
Fix: Add your frontend domain to `ALLOWED_ORIGINS` in the backend environment variables.

### MediaPipe service crashes (out of memory)
Fix: Increase container memory to at least 2 GB. On Railway: Settings → Resources → increase memory.

---

## Quick Start Commands Summary

```bash
# Local development (all services)
docker-compose up --build

# Local development (individual services)
docker-compose up --build postgres backend      # Backend only
docker-compose up --build ai-service mediapipe-service   # Python services only
docker-compose up --build frontend              # Frontend only

# Railway CLI deployment
railway login
railway link
railway up

# Check service health
curl https://your-backend.railway.app/api/auth/register
curl https://your-ai.railway.app/
curl https://your-mediapipe.railway.app/
```
