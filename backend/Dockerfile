# backend/Dockerfile  (DEV)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install deps
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy code
COPY backend/ ./

EXPOSE 8000

# Migrate and run Django dev server (auto-reload)
CMD ["/bin/sh","-lc","python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
