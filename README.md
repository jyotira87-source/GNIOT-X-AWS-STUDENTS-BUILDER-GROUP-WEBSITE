# GNIOT X AWS Builders Hub

Production-ready monorepo for the **Campus Developer Community Platform**.

## Architecture

- `frontend/`: Next.js App Router (TypeScript, Tailwind, shadcn-style components)
- `backend/`: FastAPI (Pydantic v2, SQLAlchemy 2.0, Alembic)
- Database: PostgreSQL (Amazon RDS-ready)
- Auth: JWT in HTTP-only cookies
- Deploy targets:
  - Frontend: AWS Amplify Gen 2
  - Backend: AWS App Runner with Docker

## Monorepo Structure

```text
gniot-builder-hub/
├── frontend/
└── backend/
```

## Quick Start

### 1) Backend

```bash
cd backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Overview

- Auth:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
- Events:
  - `GET /api/v1/events`
  - `POST /api/v1/events` (Admin/Leader)
  - `POST /api/v1/events/{event_id}/rsvp`
  - `GET /api/v1/events/{event_id}/rsvps/export` (Admin/Leader CSV)
- Projects:
  - `GET /api/v1/projects`
  - `POST /api/v1/projects/submit`
  - `PATCH /api/v1/projects/{project_id}/approve` (Admin/Leader)
  - `GET /api/v1/projects/all` (Admin/Leader)
- Dashboard:
  - `GET /api/v1/dashboard/stats` (Admin/Leader)

## AWS Deployment Notes

- Backend container image from `backend/Dockerfile` deploys directly to AWS App Runner.
- Configure App Runner env vars from `backend/.env.example`.
- Provision PostgreSQL on Amazon RDS and set `DATABASE_URL`.
- Frontend can also be deployed to Vercel. In Vercel, set the root directory to `frontend` and add:
  - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-domain>`
- Frontend in Amplify Gen 2 should set:
  - `NEXT_PUBLIC_API_BASE_URL=https://<app-runner-service-domain>`
- Enable CORS by setting backend `FRONTEND_URL` to Amplify domain.
