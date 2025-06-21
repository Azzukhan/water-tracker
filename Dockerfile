# 1. Build backend (Python/Django)
FROM python:3.12-slim AS backend

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY backend ./

# 2. Build frontend (React)
FROM node:20 AS frontend

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend ./
RUN npm run build

# 3. Final stage: Collect everything and run
FROM python:3.12-slim

WORKDIR /app

# Copy backend code and installed packages
COPY --from=backend /app /app

# Copy React build into Django staticfiles
COPY --from=frontend /frontend/build /app/static

# Collect Django static files
RUN pip install --upgrade pip && pip install -r requirements.txt \
    && python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "uk_water_tracker.wsgi:application", "--bind", "0.0.0.0:8000"]
