# PromptCraft

A comprehensive web-based framework for assessing and evaluating "prompting proficiency" in technical interviews - the ability to effectively instruct AI language models for code generation.

## Overview

PromptCraft is designed for technical interviewers and hiring managers who want to evaluate a candidate's ability to leverage AI tools effectively. In an era where Large Language Models (LLMs) can generate code, the bottleneck is shifting towards the human's capacity to articulate clear, specific, and intelligent instructions. PromptCraft provides a structured approach to assess this critical skill.

## Project Vision

We envision PromptCraft as a versatile and extensible tool that enables technical interviewers to:

- Design targeted code generation tasks that probe different aspects of prompting ability
- Objectively evaluate a candidate's prompts based on clarity, specificity, and technical understanding
- Gain insights into a candidate's problem-solving approach when interacting with AI
- Identify candidates who can effectively collaborate with AI to enhance productivity and code quality

## Core Components

The PromptCraft workflow consists of the following components:

1. **靈感 (Inspiration)** - Gathering ideas for effective assessment tasks
2. **對談需求 (Dialogue Requirements)** - Defining the prompt-based interaction parameters
3. **用戶故事 (User Stories)** - Identifying key personas and their needs
4. **驗收標準 (Acceptance Criteria)** - Establishing clear evaluation metrics
5. **編寫程式 (Program Development)** - Implementing the assessment framework
6. **測試程式 (Program Testing)** - Validating the functionality and effectiveness

## Implementation

PromptCraft is implemented as a modern full-stack web application with comprehensive features:

### 🌐 **Frontend (Next.js 14)**
- **Modern Web Interface**: Complete React-based UI with TypeScript
- **Authentication System**: User registration, login, and JWT token management
- **Question Browser**: Browse and filter prompting challenges by difficulty and language
- **Interactive Submission Interface**: Real-time prompt submission with AI response display
- **Evaluation Dashboard**: Comprehensive view of expert evaluations and feedback
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### 🚀 **Backend (FastAPI)**
- **RESTful API**: Complete REST endpoints for all application functionality
- **Authentication**: JWT-based user authentication and authorization
- **Database Integration**: MySQL support with Redis caching for performance
- **LLM Integration**: OpenAI API integration for real-time code generation
- **Structured Evaluation**: Comprehensive evaluation recording and retrieval

### 🗄️ **Database & Storage**
- **MySQL Database**: Scalable relational database for production use
- **Redis Cache**: High-performance caching for API responses
- **File Storage**: Organized submission and evaluation result storage
- **Docker Support**: Full containerization for easy deployment

### 🔧 **Development Features**
- **Docker Compose**: Complete development environment setup
- **Hot Reloading**: Frontend and backend auto-reload during development
- **TypeScript**: Full type safety across the application
- **API Documentation**: Auto-generated interactive API docs
- **Unit Testing**: Comprehensive test suite with reporting

## User Stories

The following personas and goals guide PromptCraft's design:
- **New Developer / Learner**: Build foundational understanding via AI-driven explanations.
- **Feature Developer**: Quickly scaffold and enhance new features with robust prompt templates.
- **Code Maintainer / Refactorer**: Refactor and modularize code using targeted AI prompts.
- **Troubleshooter**: Systematically debug and resolve issues with AI-assisted logs.
- **Continuous Learner**: Deep-dive into technologies and best practices.
- **Contributor / Collaborator**: Use clear templates to propose and review changes.
- **Project Owner / Maintainer**: Provide structured prompt guides and metrics.

## General Architecture

PromptCraft's modern full-stack architecture includes:

### 🖥️ **Frontend (`frontend/`)**
- **Next.js 14** with App Router and TypeScript
- **State Management**: Zustand for global state and user sessions
- **UI Components**: Custom component library with Tailwind CSS
- **API Integration**: Axios client with automatic token management
- **Routing**: Protected routes with authentication middleware
- **Forms**: React Hook Form with validation
- **Notifications**: Toast notifications for user feedback

### 🔧 **Backend (`api/`)**
- **FastAPI Framework**: Modern Python web framework with automatic API docs
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Database**: MySQL with connection pooling and health checks
- **Caching**: Redis for high-performance API response caching
- **API Routers**: Organized endpoints for auth, questions, submissions, evaluations
- **Error Handling**: Structured exception handling with logging

### 📊 **Core Logic (`promptcraft/`)**
- **DatabaseHandler**: MySQL database operations with connection management
- **TaskHandler**: Task presentation and submission recording logic
- **Evaluator**: Evaluation recording and retrieval system
- **Authentication Utils**: JWT token management and password utilities
- **Redis Cache**: Caching layer for improved performance

### 🗄️ **Database & Storage**
- **MySQL Database**: Production-ready relational database
- **Redis Cache**: In-memory caching for API responses
- **File Storage**: Organized directory structure for submissions and evaluations
- **Volume Persistence**: Docker volumes for data persistence

### 🐳 **Docker Infrastructure**
- **Multi-stage Dockerfiles**: Optimized for development and production
- **Docker Compose**: Complete stack orchestration
- **Health Checks**: Service health monitoring
- **Environment Configuration**: Flexible environment variable management
- **Volume Management**: Persistent data storage

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git
- At least 4GB RAM
- Ports 3000, 8000, 3307, 6379 available

### 1. Clone and Setup
```bash
git clone <repository-url>
cd PromptCraft

# Create environment file
cp .env.example .env
# Edit .env with your settings (especially OPENAI_API_KEY)
```

### 2. Launch with Docker (Recommended)
```bash
# Start the complete stack
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 3. Manual Setup (Development)
```bash
# Backend setup
pip install -r requirements.txt
python initialize_database.py
export OPENAI_API_KEY='your_key_here'
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev
```

## User Workflows

### 👤 **For Candidates**
1. **Register/Login**: Create account or sign in at http://localhost:3000
2. **Browse Questions**: Explore available prompting challenges
3. **Submit Solutions**: Craft prompts and submit for AI code generation
4. **View Results**: See AI-generated responses and expert evaluations

### 👨‍💼 **For Evaluators**
1. **Access Dashboard**: Login to view submitted solutions
2. **Review Submissions**: Examine candidate prompts and AI responses
3. **Provide Evaluations**: Score and provide detailed feedback
4. **Track Progress**: Monitor evaluation completion and results

### 🔧 **For Administrators**
1. **Manage Questions**: Add, edit, or remove assessment tasks
2. **User Management**: Handle user accounts and permissions
3. **System Monitoring**: Monitor application health and performance
4. **Data Export**: Extract evaluation data for analysis

## 🐳 Docker Deployment

### Development Environment
```bash
# Start all services with hot-reloading
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Environment
```bash
# Set production environment variables
export NEXT_PUBLIC_API_URL_PROD=https://your-domain.com/api/v1
export MYSQL_ROOT_PASSWORD_PROD=your_secure_password
export MYSQL_PASSWORD_PROD=your_secure_password

# Deploy production stack
docker-compose -f docker-compose.prod.yml up --build -d
```

### Individual Services
```bash
# Frontend only
docker-compose up frontend -d

# Backend only
docker-compose up backend mysql_db redis_cache -d

# Database services only
docker-compose up mysql_db redis_cache -d
```

### Troubleshooting
- **Port conflicts**: Check `.env` file and modify ports if needed
- **Database issues**: Run `docker-compose down -v` to reset volumes
- **Build issues**: Use `docker-compose build --no-cache`
- **Logs**: Check `docker-compose logs [service-name]`

For detailed troubleshooting, see `DOCKER_SETUP.md`.

## 📱 Application Screenshots

### Dashboard
![Dashboard](frontend/public/dashboard-preview.png)
*Main dashboard with navigation to all features*

### Question Browser
![Questions](frontend/public/questions-preview.png)
*Browse and filter prompting challenges*

### Submission Interface
![Submission](frontend/public/submission-preview.png)
*Interactive prompt submission with AI response*

### Evaluation Dashboard
![Evaluations](frontend/public/evaluations-preview.png)
*Expert evaluations and detailed feedback*

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/users/me` - Get current user

### Questions
- `GET /api/v1/questions` - List all questions
- `GET /api/v1/questions/{id}` - Get question details

### Submissions
- `POST /api/v1/submissions` - Submit a prompt solution

### Evaluations
- `POST /api/v1/evaluations/candidate/{id}/task/{task_id}` - Create evaluation
- `GET /api/v1/evaluations/candidate/{id}` - Get candidate evaluations

Full API documentation available at `/docs` when running the backend.

## Unit Test Report

The latest unit test report summary (see `unit_test_report.md`):
```text
.......                                                                  [100%]
7 passed in 0.15s
```

## 🎯 Features

### 🔐 **Authentication & User Management**
- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Email verification system
- Protected routes and API endpoints

### 📚 **Question Management**
- Browse prompting challenges by difficulty
- Filter by programming language
- Detailed question descriptions
- Evaluation criteria display
- Question metadata (difficulty, language, etc.)

### 💻 **Interactive Submission System**
- Real-time prompt submission interface
- AI code generation via OpenAI API
- Submission history tracking
- Response formatting and display
- Character counting and validation

### 📊 **Evaluation & Feedback**
- Expert evaluation interface
- Structured scoring system
- Detailed feedback comments
- Evaluation criteria tracking
- Progress monitoring

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Clean, professional interface
- Real-time notifications
- Loading states and error handling
- Accessible components

## Use Cases

- Technical interviews for software engineering roles
- Skills assessment for AI-augmented development capabilities
- Training and skill development for prompt engineering
- Evaluating team members' ability to work effectively with AI tools

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test        # Run frontend tests
npm run lint        # Check code quality
npm run build       # Test production build
```

### Backend Testing
```bash
# Run Python unit tests
python run_unit_tests.py

# Run specific test files
pytest tests/test_db_handler.py -v
pytest tests/test_evaluator.py -v
```

### Integration Testing
```bash
# Test complete stack
docker-compose up --build -d
./test-frontend.sh

# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

### Performance Testing
```bash
# Test database performance
docker-compose exec backend python -c "from promptcraft.database.db_handler import DatabaseHandler; print('DB connection test passed')"

# Test Redis cache
docker-compose exec redis_cache redis-cli ping
```

## Software Licensing and Commercialization Plan

1. **Software Licensing:** Released under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), allowing free use, modification, and distribution with preservation of notices.
2. **Revenue Generation:** A one-time **USD 9.90** technical service fee applies to access the pre-packaged distribution, supporting ongoing development and maintenance.
3. **Payment Method:** We accept payments in **USD Coin (USDC)** and also welcome **Solana (SOL)** donations at our Phantom Wallet address:
   `ESUpLq9tCo1bmauWoN1rgNiYwwr5K587h15SrJz9L7ct`
4. **Custom Solutions:** Bespoke software development services are available. Contact us via Telegram at **@tonyironreal** to discuss your project needs.

## 🎉 Mission Accomplished!

  I have successfully implemented and integrated a comprehensive Next.js frontend for your PromptCraft application and pushed all changes
   to your repository. Here's a complete summary of what was delivered:

  📊 Commit Summary

  - Commit Hash: 433f01b
  - Files Changed: 45 files
  - Lines Added: 9,179 lines
  - Lines Removed: 237 lines
  - New Files: 39 new files created

  🚀 Major Deliverables

  🌐 Complete Frontend Application

  - Next.js 14 with App Router and TypeScript
  - Authentication system with login/register pages
  - Dashboard with user navigation
  - Question browser and detailed question views
  - Interactive submission interface with AI integration
  - Evaluation dashboard for expert feedback
  - Responsive design with Tailwind CSS

  🐳 Docker Integration

  - Updated docker-compose.yml with frontend service
  - Production docker-compose.prod.yml configuration
  - Multi-stage Dockerfiles for optimal builds
  - Environment configuration management
  - Health checks and service dependencies

  📖 Documentation

  - Updated README.md with modern architecture overview
  - DOCKER_SETUP.md comprehensive setup guide
  - Frontend README.md technical documentation
  - Environment templates (.env.example)
  - Test scripts for validation

  🔧 Technical Features

  - TypeScript integration across the entire frontend
  - Zustand state management for user sessions
  - React Hook Form for form validation
  - Axios HTTP client with token management
  - Toast notifications for user feedback
  - Protected routes with authentication middleware

  🎯 Ready to Use

  Your PromptCraft application is now a complete, modern web application ready for:

  1. Development: docker-compose up --build -d
  2. Production: docker-compose -f docker-compose.prod.yml up -d
  3. Testing: ./test-frontend.sh

  The frontend is accessible at http://localhost:3000 and integrates seamlessly with your existing FastAPI backend at
  http://localhost:8000.

  Your repository has been updated with a professional, production-ready full-stack application! 🚀

## Running Unit Tests

After installing dependencies, you can run the full test suite and generate a Markdown report:
```bash
python run_unit_tests.py
```  
This will create `unit_test_report.md` in the project root, summarizing pytest output and exit code.

## Contributing

We welcome contributions to enhance PromptCraft's capabilities. Please see our contribution guidelines for more information.

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) 
