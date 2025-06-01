import logging
import sys
import os
from logging.handlers import RotatingFileHandler

# Determine log level from environment variable, default to INFO
LOG_LEVEL_STR = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_LEVEL = getattr(logging, LOG_LEVEL_STR, logging.INFO)

# Define a custom log format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(lineno)d - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def setup_logger(name="promptcraft"):
    """Configures and returns a logger instance."""
    logger = logging.getLogger(name)
    
    # Prevent adding multiple handlers if logger is already configured (e.g., in tests or reloads)
    if logger.hasHandlers():
        # This check might be too simple if handlers are configured differently across calls.
        # For uvicorn/FastAPI, uvicorn might set up its own handlers.
        # Consider checking specific handler types or names if issues arise.
        # logger.handlers.clear() # Use with caution, might remove uvicorn's handlers
        pass # If handlers exist, assume it's configured (e.g. by uvicorn or previous call)
    else:
        logger.setLevel(LOG_LEVEL)

        # Console Handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(LOG_LEVEL)
        formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # File Handler with Rotation
        log_dir = os.getenv("LOG_DIR", "/app/logs")
        log_file_path = os.path.join(log_dir, f"{name}.log")
        
        # Create log directory if it doesn't exist
        os.makedirs(log_dir, exist_ok=True)
        
        if os.getenv("ENABLE_FILE_LOGGING", "true").lower() == "true":
            # Use RotatingFileHandler to prevent log files from getting too large
            file_handler = RotatingFileHandler(
                log_file_path,
                maxBytes=10*1024*1024,  # 10MB per file
                backupCount=5,          # Keep 5 backup files
                encoding='utf-8'
            )
            file_handler.setLevel(LOG_LEVEL)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
            logger.info(f"File logging enabled. Log file: {log_file_path} (max 10MB, 5 backups)")
            
            # Also create an error-only log file
            error_log_path = os.path.join(log_dir, f"{name}_errors.log")
            error_handler = RotatingFileHandler(
                error_log_path,
                maxBytes=5*1024*1024,   # 5MB per file
                backupCount=3,          # Keep 3 backup files
                encoding='utf-8'
            )
            error_handler.setLevel(logging.ERROR)
            error_handler.setFormatter(formatter)
            logger.addHandler(error_handler)
            logger.info(f"Error logging enabled. Error file: {error_log_path} (max 5MB, 3 backups)")

    # logger.propagate = False # Be careful with this in web frameworks, 
                                # as it might stop uvicorn/FastAPI from logging requests.
                                # Default is usually fine unless specific issues.
    return logger

# Example of a globally accessible logger instance, initialized once.
# logger = setup_logger("promptcraft_global")

# Usage in other modules:
# from promptcraft.logger_config import setup_logger
# logger = setup_logger(__name__) # Best practice: get logger for current module
# logger.info("This is an info message from my_module.") 