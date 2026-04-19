# QuickResolveAI

AI-powered complaint intake and analysis platform.

## Tech

- Backend: FastAPI + MongoDB
- Frontend: React + TypeScript + Vite

## Quick Start

### 1) Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017
DEBUG=True

AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Optional Gemini config
# AI_PROVIDER=gemini
# GEMINI_API_KEY=your_gemini_api_key
# GEMINI_MODEL=gemini-1.5-flash
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

If backend is not at `http://localhost:8000`, set `VITE_API_URL` in frontend env.

## Core API Endpoints

- `GET /health`
- `POST /complaint`
- `POST /api/analyze-complaint`
- `GET /complaints`
- `PATCH /complaint/{id}`
- `GET /dashboard`

## Main Code Locations

- Backend entry: `backend/main.py`
- Complaint logic: `backend/services/complaint_service.py`
- AI analysis: `backend/services/ai_analysis_service.py`
- Frontend API client: `frontend/src/lib/api.ts`
- Frontend routes: `frontend/src/routes`
