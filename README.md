# QuickResolveAI

AI-powered complaint classification and resolution system.

## What it includes

- Backend API in [backend/main.py](backend/main.py)
- Frontend app in [frontend/src](frontend/src)
- MongoDB persistence

## Stack

- Backend: FastAPI, MongoDB
- Frontend: React, TypeScript, Vite

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Create a `.env` file in `backend/` with:

```env
MONGO_URI=mongodb://localhost:27017
DEBUG=True
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
# Or use Gemini:
# AI_PROVIDER=gemini
# GEMINI_API_KEY=your_gemini_api_key
# GEMINI_MODEL=gemini-1.5-flash
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set the API URL with `VITE_API_URL` if the backend is not running at `http://localhost:8000`.

## API Overview

The frontend client in [frontend/src/lib/api.ts](frontend/src/lib/api.ts) uses these endpoints:

- `GET /health`
- `POST /complaint`
- `POST /api/analyze-complaint`
- `GET /complaints`
- `PATCH /complaint/{id}`
- `GET /dashboard`

## Notes

- Backend implementation and schema details live in [backend/models.py](backend/models.py), [backend/database.py](backend/database.py), and [backend/services/complaint_service.py](backend/services/complaint_service.py).
- Frontend routes live in [frontend/src/routes](frontend/src/routes).
