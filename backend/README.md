# Backend - GNIOT X AWS Builders Hub

FastAPI backend with JWT cookie auth, SQLAlchemy 2.0 models, and Alembic migrations.

## Run

```bash
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

## Migration

Initial migration:
- `alembic/versions/20260528_0001_initial_schema.py`

Apply migrations:

```bash
alembic upgrade head
```

## Auth Model

JWT token is set in `HTTP-only` cookie configured by:
- `COOKIE_NAME`
- `COOKIE_SECURE`
- `COOKIE_SAMESITE`
