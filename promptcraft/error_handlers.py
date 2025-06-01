"""
Centralized error handling for PromptCraft application.
"""
import traceback
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from promptcraft.logger_config import setup_logger

logger = setup_logger("promptcraft.error_handlers")

class PromptCraftError(Exception):
    """Base exception class for PromptCraft application."""
    
    def __init__(self, message: str, error_code: str = "PROMPTCRAFT_ERROR", details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)

class DatabaseError(PromptCraftError):
    """Database-related errors."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "DATABASE_ERROR", details)

class AuthenticationError(PromptCraftError):
    """Authentication-related errors."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "AUTHENTICATION_ERROR", details)

class ValidationError(PromptCraftError):
    """Data validation errors."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "VALIDATION_ERROR", details)

class ExternalServiceError(PromptCraftError):
    """External service (OpenAI, etc.) errors."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "EXTERNAL_SERVICE_ERROR", details)

class NotFoundError(PromptCraftError):
    """Resource not found errors."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "NOT_FOUND_ERROR", details)

def log_error(error: Exception, request: Optional[Request] = None, extra_context: Optional[Dict[str, Any]] = None):
    """Log error with comprehensive context."""
    context = {
        "error_type": type(error).__name__,
        "error_message": str(error),
        "traceback": traceback.format_exc(),
    }
    
    if request:
        context.update({
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
        })
    
    if extra_context:
        context.update(extra_context)
    
    if isinstance(error, PromptCraftError):
        context["error_code"] = error.error_code
        context["error_details"] = error.details
    
    logger.error(f"Error occurred: {context}")

async def promptcraft_exception_handler(request: Request, exc: PromptCraftError):
    """Handle PromptCraft custom exceptions."""
    log_error(exc, request)
    
    status_code = 500
    if isinstance(exc, AuthenticationError):
        status_code = 401
    elif isinstance(exc, ValidationError):
        status_code = 400
    elif isinstance(exc, NotFoundError):
        status_code = 404
    elif isinstance(exc, DatabaseError):
        status_code = 500
    elif isinstance(exc, ExternalServiceError):
        status_code = 503
    
    return JSONResponse(
        status_code=status_code,
        content={
            "error_type": exc.error_code,
            "detail": exc.message,
            "error_details": exc.details,
            "request_id": getattr(request.state, "request_id", None)
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle FastAPI HTTP exceptions."""
    log_error(exc, request)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_type": "HTTP_ERROR",
            "detail": exc.detail,
            "request_id": getattr(request.state, "request_id", None)
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    log_error(exc, request, {"validation_errors": exc.errors()})
    
    return JSONResponse(
        status_code=422,
        content={
            "error_type": "VALIDATION_ERROR",
            "detail": "Request validation failed",
            "validation_errors": exc.errors(),
            "request_id": getattr(request.state, "request_id", None)
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions."""
    log_error(exc, request)
    
    return JSONResponse(
        status_code=500,
        content={
            "error_type": "INTERNAL_SERVER_ERROR",
            "detail": "An unexpected error occurred",
            "request_id": getattr(request.state, "request_id", None)
        }
    )

def setup_error_handlers(app):
    """Setup all error handlers for the FastAPI app."""
    app.add_exception_handler(PromptCraftError, promptcraft_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    logger.info("Error handlers registered successfully")