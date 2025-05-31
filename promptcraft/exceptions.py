# promptcraft/exceptions.py

class PromptCraftBaseException(Exception):
    """Base exception for PromptCraft application."""
    status_code: int = 500
    detail: str = "An unexpected internal server error occurred."

    def __init__(self, detail: str | None = None, status_code: int | None = None):
        super().__init__(detail or self.detail)
        if status_code is not None:
            self.status_code = status_code
        if detail is not None:
            self.detail = detail

class DatabaseException(PromptCraftBaseException):
    """Custom exception for database related errors."""
    status_code = 503 # Service Unavailable
    detail = "A database error occurred."

class CacheException(PromptCraftBaseException):
    """Custom exception for cache related errors."""
    status_code = 503 # Service Unavailable
    detail = "A cache service error occurred."

class LLMConnectionException(PromptCraftBaseException):
    """Custom exception for errors connecting to the LLM service."""
    status_code = 504 # Gateway Timeout
    detail = "Could not connect to the Language Model service."

class LLMProcessingException(PromptCraftBaseException):
    """Custom exception for errors during LLM processing or response generation."""
    status_code = 502 # Bad Gateway
    detail = "Error processing request with the Language Model service."

class NotFoundException(PromptCraftBaseException):
    """Custom exception for resource not found errors."""
    status_code = 404
    detail = "The requested resource was not found."

class BadRequestException(PromptCraftBaseException):
    """Custom exception for bad request errors (e.g., invalid input)."""
    status_code = 400
    detail = "The request was invalid or cannot be otherwise served."

class BusinessLogicException(PromptCraftBaseException):
    """For general application-specific business rule violations."""
    status_code = 409 # Conflict, or could be 400 depending on context
    detail = "A business logic error occurred." 