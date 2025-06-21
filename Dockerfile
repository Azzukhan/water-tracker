# Step 1: Build backend dependencies
FROM python:3.12-slim as backend
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Step 2: Copy backend source code
COPY backend ./

# Step 3: Build React frontend
FROM node:20 as frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend ./
RUN npm run build

# Step 4: Final image with everything
FROM python:3.12-slim
WORKDIR /app

# Copy backend and its deps
COPY --from=backend /app /app

# Copy built React frontend to Django staticfiles directory
COPY --from=frontend /frontend/build /app/static

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Collect static files
RUN pip install --upgrade pip && pip install -r requirements.txt && python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "uk_water_tracker.wsgi:application", "--bind", "0.0.0.0:8000"]
