# HRMS Lite

## Project Overview
HRMS Lite is a lightweight web app to manage employees and track daily attendance.  
It includes a React frontend and a FastAPI backend with a simple REST API.

## Tech Stack Used
- Frontend: React (Vite)
- Backend: FastAPI (Python)
- Database: PostgreSQL (Render) or SQLite for local development

## Steps To Run Locally
### Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

### Configure API URL (Frontend)
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

### Configure Database (Backend)
Set a `DATABASE_URL` environment variable for Postgres:
```
postgresql://USER:PASSWORD@HOST:PORT/DBNAME
```
If `DATABASE_URL` is not set, the app uses local SQLite (`hrms.db`).

## Assumptions Or Limitations
- Single admin user (no authentication).
- Attendance is unique per employee per date.
- Designed for small to medium datasets (HRMS Lite).
