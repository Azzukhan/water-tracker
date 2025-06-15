# UK Water Tracker

This project consists of a Next.js frontend and a Django backend. The frontend fetches data from the backend using the `BACKEND_URL` environment variable.

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

By default the backend runs on `http://127.0.0.1:8000`.

### 2. Frontend

Create a `.env.local` file in the project root (or copy from `.env.example`) and set `BACKEND_URL` to the URL where the Django server is running:

```
BACKEND_URL=http://localhost:8000
```

Then install dependencies and start the Next.js app:

```
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.
