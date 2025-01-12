#!/bin/sh

# Wait for database
while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
    echo "Waiting for database..."
    sleep 1
done

echo "Database started"

# Apply database migrations
python manage.py migrate

# Start Gunicorn
exec gunicorn djangoProject1.wsgi:application --bind 0.0.0.0:8000
