#!/bin/bash

# Simple script to test frontend independently
echo "🚀 Testing PromptCraft Frontend"

# Stop any existing containers
docker-compose down

# Build and start just the frontend
echo "Building and starting frontend..."
docker-compose build frontend
docker-compose up frontend -d

# Wait for the frontend to start
echo "Waiting for frontend to start..."
sleep 15

# Test if frontend is responding
echo "Testing frontend health..."
curl -f http://localhost:3000/ || echo "Frontend not responding on port 3000"

# Show logs
echo "Frontend logs:"
docker-compose logs frontend --tail=20

echo "✅ Frontend test complete. Access at http://localhost:3000"