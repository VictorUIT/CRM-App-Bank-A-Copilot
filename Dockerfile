FROM python:3.12-slim

# Set working directory to project root
WORKDIR /app

# Copy all project files (backend + mcp-server)
COPY . .

# Install backend dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Change to backend directory before starting
WORKDIR /app/backend

# Railway injects $PORT, fallback to 8000 for local
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
