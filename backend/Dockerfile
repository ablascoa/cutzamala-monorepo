FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies including PostgreSQL client
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt for better caching
COPY requirements.txt ./

# Install dependencies directly (faster than pipenv)
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash apiuser
RUN chown -R apiuser:apiuser /app
USER apiuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Start the application (Railway provides PORT env var)
CMD ["python", "main.py", "--host", "0.0.0.0"]