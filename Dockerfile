# 1) Frontend build & export
FROM node:20 AS fe
WORKDIR /fe
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build && npx next export

# 2) Python deps into wheels
FROM python:3.12-slim AS deps
WORKDIR /app
ENV PIP_NO_CACHE_DIR=1 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip wheel --wheel-dir=/wheels -r requirements.txt

# 3) Runtime
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    TF_CPP_MIN_LOG_LEVEL=3 CUDA_VISIBLE_DEVICES=-1

COPY --from=deps /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

# Backend
COPY backend/ ./

# Put exported Next static into a folder Django collects
# (make sure STATICFILES_DIRS includes this path, or place inside a known static dir)
COPY --from=fe /fe/out /app/frontend_export

# Collect static (ignore errors in build)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8080
CMD ["bash","-lc","python manage.py migrate && gunicorn uk_water_tracker.wsgi:application --bind 0.0.0.0:$PORT"]
