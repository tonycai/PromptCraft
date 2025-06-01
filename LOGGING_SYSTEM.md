# PromptCraft Logging & Error Handling System

This document describes the comprehensive logging and error handling system implemented in PromptCraft.

## 🔍 System Overview

The logging system provides:
- **Persistent log storage** with Docker volumes
- **Comprehensive error handling** with custom exception classes  
- **Request/response logging** with unique request IDs
- **Log rotation** to prevent disk space issues
- **Real-time monitoring** tools and dashboards
- **Security headers** and middleware

## 📁 Log Storage Architecture

### Docker Volume Configuration
```yaml
# docker-compose.yml
volumes:
  backend_logs:/app/logs  # Persistent log storage

environment:
  ENABLE_FILE_LOGGING: true
  LOG_DIR: /app/logs
  LOG_LEVEL: INFO
```

### Log File Structure
```
/app/logs/
├── api.main.log                           # Main API logs
├── api.main_errors.log                    # API errors only
├── api.routers.submissions.log            # Submission-specific logs
├── api.routers.submissions_errors.log     # Submission errors
├── promptcraft.middleware.log             # Request/response logs
├── promptcraft.database.db_handler.log    # Database operation logs
└── ...                                    # Other module logs
```

### Log Rotation
- **Main logs**: 10MB max, 5 backup files
- **Error logs**: 5MB max, 3 backup files
- **Automatic rotation** prevents disk space issues
- **UTF-8 encoding** for proper character support

## 🚨 Error Handling System

### Custom Exception Classes

**Base Exception**:
```python
class PromptCraftError(Exception):
    def __init__(self, message: str, error_code: str, details: dict = None)
```

**Specific Exceptions**:
- `DatabaseError` - Database operation failures
- `AuthenticationError` - Authentication/authorization issues
- `ValidationError` - Data validation failures
- `ExternalServiceError` - OpenAI/external API issues
- `NotFoundError` - Resource not found errors

### Error Response Format
```json
{
  "error_type": "DATABASE_ERROR",
  "detail": "Failed to save submission to database",
  "error_details": {
    "user_id": 4,
    "task_id": 1
  },
  "request_id": "b0b18ab7-07ef-46e2-b3c0-b02816dc5373"
}
```

### Error Logging Context
```python
{
  "error_type": "DatabaseError",
  "error_message": "Connection failed",
  "traceback": "Full stack trace...",
  "method": "POST",
  "url": "/api/v1/submissions",
  "client_ip": "172.18.0.1",
  "user_agent": "curl/8.9.1",
  "request_id": "unique-request-id"
}
```

## 📊 Request Logging & Middleware

### Request Logging Middleware
Every request is logged with:
- **Unique Request ID** (UUID4)
- **Method, URL, Client IP**
- **User Agent**
- **Processing Duration**
- **Response Status Code**

### Example Request Log
```
2025-06-01 05:01:28 - promptcraft.middleware - INFO - middleware:25 - 
Request started - ID: b0b18ab7-07ef-46e2-b3c0-b02816dc5373 | 
Method: POST | URL: http://localhost:8000/api/v1/submissions | 
Client: 172.18.0.1 | User-Agent: curl/8.9.1

2025-06-01 05:01:30 - promptcraft.middleware - INFO - middleware:41 - 
Request completed - ID: b0b18ab7-07ef-46e2-b3c0-b02816dc5373 | 
Status: 201 | Duration: 2.349s
```

### Security Headers Middleware
Automatically adds security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 🛠️ Monitoring Tools

### Log Analysis Script
**File**: `log_analysis.sh`

**Commands**:
```bash
# Show recent errors
./log_analysis.sh errors -n 50

# Show HTTP request statistics  
./log_analysis.sh requests

# Show comprehensive log statistics
./log_analysis.sh stats

# Search for specific patterns
./log_analysis.sh search -p "submission.*failed"

# Tail logs in real-time
./log_analysis.sh tail -m api.routers.submissions

# Check log rotation status
./log_analysis.sh rotate

# System health check
./log_analysis.sh health
```

### Real-time Dashboard
**File**: `log_dashboard.sh`

**Features**:
- Real-time system status
- Error summary (last 10 minutes)
- Request statistics with status codes
- Average response times
- Recent activity feed
- Log file sizes

**Usage**:
```bash
./log_dashboard.sh
# Press Ctrl+C to exit
```

## 📈 Log Persistence & Data Integrity

### Volume Persistence Test Results
```bash
# Before restart: Logs present ✓
# After container restart: Logs persist ✓  
# After complete shutdown: Logs persist ✓
# Cross-host migration: Supported via volume backup ✓
```

### Host Volume Location
```bash
# Volume path on host
/var/lib/docker/volumes/promptcraft_backend_logs/_data/

# Check persistence
sudo ls -la /var/lib/docker/volumes/promptcraft_backend_logs/_data/
```

### Backup Integration
Logs are automatically included in volume backups:
```bash
# Create backup including logs
docker run --rm -v promptcraft_backend_logs:/source -v $(pwd):/backup \
  alpine tar czf /backup/logs_backup_$(date +%Y%m%d).tar.gz -C /source .

# Restore logs  
docker run --rm -v promptcraft_backend_logs:/target -v $(pwd):/backup \
  alpine tar xzf /backup/logs_backup_20250601.tar.gz -C /target
```

## 🔧 Configuration

### Environment Variables
```bash
# Enable/disable file logging
ENABLE_FILE_LOGGING=true

# Log directory path
LOG_DIR=/app/logs

# Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_LEVEL=INFO
```

### Logger Configuration
```python
# Custom logger setup per module
from promptcraft.logger_config import setup_logger
logger = setup_logger(__name__)

# Automatic features:
# - File rotation (10MB main, 5MB errors)
# - UTF-8 encoding
# - Structured log format
# - Error-only log files
```

### Log Format
```
YYYY-MM-DD HH:MM:SS - module.name - LEVEL - file:line - message
```

## 📊 Performance Metrics

### Log File Sizes (Production Example)
```
api.main.log                    959B
api.routers.submissions.log     1.4K  
promptcraft.middleware.log      6.6K
promptcraft.database.db_handler.log  2.1K
Total Log Directory Size:       52K
```

### Request Statistics Example
```
Status Codes:
  200: 14 (93.3%)
  201: 1 (6.7%)
  Total: 15 requests

Average Response Time:
  Average: 0.156s over 15 requests
```

## 🚨 Monitoring & Alerting

### Health Check Indicators
- ✅ **Log Directory**: Writable and accessible
- ✅ **Recent Activity**: Files updated in last 5 minutes  
- ✅ **Permissions**: All log files writable
- ✅ **Disk Usage**: < 80% (⚠️ 80-90%, ❌ >90%)

### Error Monitoring
```bash
# Check for critical errors
./log_analysis.sh errors | grep CRITICAL

# Monitor error rates
./log_analysis.sh stats | grep "errors"

# Real-time error tracking
./log_dashboard.sh  # Shows error summary
```

## 🔍 Troubleshooting

### Common Issues

**Issue**: Permission denied for log files
```bash
# Fix permissions
docker exec --user root CONTAINER chown -R appuser:appuser /app/logs
```

**Issue**: Logs not persisting
```bash
# Check volume mount
docker inspect CONTAINER | grep -A 10 "Mounts"
# Verify volume exists
docker volume ls | grep backend_logs
```

**Issue**: High disk usage
```bash
# Check log sizes
./log_analysis.sh rotate
# Manual cleanup if needed
docker exec CONTAINER find /app/logs -name "*.log.*" -mtime +7 -delete
```

### Debug Commands
```bash
# Test logging system
curl -X GET http://localhost:8000/health
./log_analysis.sh requests -n 5

# Check specific module
./log_analysis.sh tail -m api.routers.submissions

# Search for errors
./log_analysis.sh search -p "ERROR.*database"
```

## 📋 Best Practices

### ✅ **Implemented**
- Structured logging with consistent format
- Request correlation via unique IDs
- Automatic log rotation
- Persistent storage with Docker volumes
- Comprehensive error handling
- Real-time monitoring tools

### 🎯 **Recommendations**
- Monitor log disk usage regularly
- Set up log aggregation for production
- Configure log shipping to external systems
- Implement log-based alerting
- Regular log backup verification

---

**Summary**: The PromptCraft logging system provides comprehensive, persistent, and monitorable logging with automatic rotation, structured error handling, and real-time analysis tools. All logs survive container restarts and system reboots through Docker volumes.