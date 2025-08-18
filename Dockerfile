# 1) Build deps into wheels
FROM python:3.12-slim AS deps
WORKDIR /app
ENV PIP_NO_CACHE_DIR=1 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip wheel --wheel-dir=/wheels -r requirements.txt

# 2) Runtime
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    TF_CPP_MIN_LOG_LEVEL=3 CUDA_VISIBLE_DEVICES=-1

# Install deps
COPY --from=deps /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

# Copy backend code
COPY backend/ ./

# Collect static (don’t fail the build if settings need DB)
RUN python manage.py collectstatic --noinput || true

# Railway sets $PORT; expose for clarity
EXPOSE 8080

# Bind to $PORT (NOT 8000) and run migrations on boot
CMD ["bash","-lc","python manage.py migrate && gunicorn uk_water_tracker.wsgi:application --bind 0.0.0.0:$PORT"]
