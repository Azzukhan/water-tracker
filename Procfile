web: cd backend && gunicorn uk_water_project.wsgi --bind 0.0.0.0:8000
release: cd frontend && npm install --legacy-peer-deps && npm run build && cd ../backend && python manage.py collectstatic --noinput
