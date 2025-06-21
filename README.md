# UK Water Tracker

This project consists of a Next.js frontend and a Django backend. The frontend fetches data from the backend using the `NEXT_PUBLIC_API_URL` environment variable.

## Getting Started

### 1. Backend

```
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

To populate historical Scottish Water resource levels from the Wayback Machine,
run:

```
python manage.py import_scottish_history
```

To quickly view the current Scottish Water tables without interacting with the database, run:

```
python scripts/print_scottish_resources.py
```

### Scheduled Updates

Water level data is kept fresh using Celery beat. Every **Wednesday** the
backend automatically:

1. Scrapes the latest Scottish Water resource levels.
2. Retrieves new Severn Trent reservoir data and generates 4‑week
   forecasts.

No manual intervention is required as long as the Celery worker and beat
processes are running.

By default the backend runs on `http://127.0.0.1:8000`.

### 2. Frontend

All Next.js code now resides in the `frontend` directory.
Create a `.env.local` file inside `frontend` (or copy from `frontend/.env.example`) and set `NEXT_PUBLIC_API_URL` to the URL where the Django server is running:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then install dependencies and start the Next.js app from within `frontend`:

```
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.
For more details, visit [ukwatertracker.co.uk](https://ukwatertracker.co.uk).
