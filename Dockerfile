# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . ./

# Prepare output directories
RUN mkdir -p candidate_submissions evaluation_results

# Initialize databases (PromptCraft tasks and exam questions)
RUN python initialize_database.py && python exam_init.py

# Default entrypoint: run PromptCraft CLI via package module
ENTRYPOINT ["python", "-m", "promptcraft.cli"]
## No default CMD so that passing only env var triggers an assessment run.
## To see help, run with --help.