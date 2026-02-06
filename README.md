# HRMS Lite

A lightweight, production-style HRMS Lite system to manage employees and track daily attendance. Built with React + FastAPI + SQLite.

## Tech Stack
- Frontend: React (Vite)
- Backend: FastAPI (Python)
- Database: SQLite

## Features
- Add, list, and delete employees
- Mark daily attendance (Present/Absent)
- View attendance per employee
- Summary counts (employees + attendance records)
- Clean, responsive UI with empty/loading/error states

## Project Structure
- `backend/` FastAPI API + SQLite
- `frontend/` React UI (Vite)

## Backend Setup
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API will run at `http://localhost:8000`.

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`.

### Configure API URL
The frontend reads the backend URL from `VITE_API_URL`.
Create a `.env` file inside `frontend/` if needed:
```
VITE_API_URL=http://localhost:8000
```

## Assumptions & Limitations
- Single admin user (no authentication).
- Attendance is unique per employee per date. Duplicate attendance marks return a 409.
- SQLite is used for simplicity; can be swapped for Postgres/MySQL.

## Deployment Notes (User will deploy)
- Backend: deploy the `backend/` folder to Render/Railway.
- Frontend: deploy the `frontend/` folder to Vercel/Netlify.
- Set `VITE_API_URL` to the deployed backend URL.
