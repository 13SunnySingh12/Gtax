# G-TAX FastAPI AI service — standalone Dockerfile.
# Build context is this folder, so container hosts (e.g. Render, Railway, Fly)
# can build the AI service directly from the AI/ directory.
FROM python:3.12-slim
WORKDIR /app

# System deps kept minimal; psycopg[binary] ships its own libpq.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY data ./data

# Hosts inject $PORT; default to 8000 for local runs.
ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
