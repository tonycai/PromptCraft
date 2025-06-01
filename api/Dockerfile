# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install poetry (or pip if you prefer direct pip install)
# Using pip directly for this example as requirements.txt is already present
RUN pip install --upgrade pip

# Copy only requirements to leverage Docker cache
COPY requirements.txt .

# Install dependencies
# --prefix /install will install packages to a separate directory to be copied to the final stage
# This helps keep the final image cleaner if only specific packages are needed
# However, for simplicity and because FastAPI apps often use many of these at runtime, 
# we'll install them directly in a way that can be copied or used in a venv.
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# Stage 2: Final Production Image
FROM python:3.11-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user and group
RUN groupadd -r appuser && useradd --no-log-init -r -g appuser appuser

# Copy installed packages from builder stage
COPY --from=builder /wheels /wheels

# Install the wheels
RUN pip install --no-cache /wheels/*

# Copy the application code from the project root's api directory
# Adjust this if your Docker context is the api directory itself
# Assuming context is project root, so copy ./api to /app/api in container
COPY ./api /app/api
COPY ./promptcraft /app/promptcraft
COPY ./initialize_database.py /app/
COPY ./exam_init.py /app/
COPY ./wait_for_mysql.py /app/
COPY ./prompts /app/prompts

# Create directories for persistent data if they are not created by the app itself
# These should ideally be mounted as volumes
RUN mkdir -p /app/candidate_submissions /app/evaluation_results /app/database_files && \
    chown -R appuser:appuser /app

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV OPENAI_API_KEY=""
# The APP_MODULE for Gunicorn, if main.py is in /app/api/
ENV APP_MODULE="api.main:app"
ENV HOST=0.0.0.0
ENV PORT=8000

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Healthcheck using the dedicated /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Command to run the application using Gunicorn with Uvicorn workers
# The database initialization should ideally happen before the app starts or via an entrypoint script.
# For simplicity here, it's assumed they might be run manually or via an init command in docker-compose.
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "--bind", "0.0.0.0:8000", "api.main:app"] 