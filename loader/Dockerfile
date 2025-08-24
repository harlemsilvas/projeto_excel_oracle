FROM python:3.12-slim

# Dependências nativas (psycopg2)
RUN apt-get update && apt-get install -y \
    build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY wait_for_db.py ingest.py ./

# Default command definido no compose (command:)
