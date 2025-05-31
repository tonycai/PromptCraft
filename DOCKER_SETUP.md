# PromptCraft Docker Setup Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 3000, 8000, 3307, and 6379 available

### 1. Environment Setup

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```bash
# MySQL Configuration
MYSQL_ROOT_PASSWORD=supersecretroot
MYSQL_DATABASE=promptcraft_db
MYSQL_USER=promptcraft_user
MYSQL_PASSWORD=promptcraft_password
MYSQL_PORT=3307

# Redis Configuration
REDIS_PORT=6379

# Application Configuration
LOG_LEVEL=INFO

# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Launch Development Environment

```bash
# Start the complete stack
docker-compose up --build -d

# Or start services individually
docker-compose up mysql_db redis_cache -d
docker-compose up backend -d
docker-compose up frontend -d
```

### 3. Test Frontend Only

```bash
# Run the test script
./test-frontend.sh
```

## 📊 Services

### Frontend (Next.js)
- **Port**: 3000
- **URL**: http://localhost:3000
- **Features**: Authentication, Question browsing, Submission interface, Evaluation dashboard

### Backend (FastAPI)
- **Port**: 8000
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### MySQL Database
- **Port**: 3307 (changed from default 3306)
- **Database**: promptcraft_db

### Redis Cache
- **Port**: 6379
- **Used for**: API response caching

## 🔧 Development Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs frontend -f
docker-compose logs backend -f
```

### Rebuild Services
```bash
# Rebuild all
docker-compose build --no-cache

# Rebuild specific service
docker-compose build frontend
docker-compose build backend
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🌐 Frontend Features

The Next.js frontend includes:

### Authentication
- User registration and login
- JWT token management
- Protected routes

### Question Management
- Browse available questions
- View question details and criteria
- Difficulty and language filtering

### Submission System
- Interactive prompt submission
- Real-time character counting
- AI response display

### Evaluation Dashboard
- View expert evaluations
- Score and feedback display
- Evaluation criteria breakdown

## 🔧 Production Deployment

For production, use the production compose file:

```bash
# Set production environment variables
export NEXT_PUBLIC_API_URL_PROD=https://your-domain.com/api/v1
export MYSQL_ROOT_PASSWORD_PROD=your_secure_password
export MYSQL_PASSWORD_PROD=your_secure_password

# Deploy
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🐛 Troubleshooting

### Port Conflicts
If you get port binding errors:
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8000
sudo netstat-tulpn | grep :3307

# Stop conflicting services or change ports in .env
```

### MySQL Connection Issues
```bash
# Check MySQL health
docker-compose exec mysql_db mysql -u root -p -e "SHOW DATABASES;"

# Reset MySQL data
docker-compose down -v
docker volume rm promptcraft_mysql_data_dev
```

### Frontend Build Issues
```bash
# Clear Node modules and rebuild
docker-compose down
docker-compose build --no-cache frontend
docker-compose up frontend -d
```

### Database Initialization
The database initialization container may need manual intervention:
```bash
# Run initialization manually
docker-compose exec backend python initialize_database.py
docker-compose exec backend python exam_init.py
```

## 📝 Development Notes

- Frontend uses hot-reloading in development mode
- Backend auto-reloads with uvicorn --reload
- Database data persists in Docker volumes
- Use `docker-compose down -v` to reset all data

## 🔐 Security Notes

- Change default passwords in production
- Use environment-specific .env files
- Don't commit .env files to version control
- Enable HTTPS in production
- Consider using secrets management for sensitive data

## 📚 API Documentation

Once the backend is running, visit:
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc