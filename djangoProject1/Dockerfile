FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for MySQL
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app/

# Specify the default command to run the application
CMD ["gunicorn", "djangoProject1.wsgi:application", "--bind", "0.0.0.0:8000"]
