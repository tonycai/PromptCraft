import logging
import sys
import os

# Determine log level from environment variable, default to INFO
LOG_LEVEL_STR = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_LEVEL = getattr(logging, LOG_LEVEL_STR, logging.INFO)

# Define a custom log format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(lineno)d - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def setup_logger(name="promptcraft"):
    \"\"\"Configures and returns a logger instance.\"\"\"
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

        # Optional: File Handler (Uncomment and configure if needed)
        # log_file_path = os.getenv("LOG_FILE_PATH", "promptcraft_app.log")
        # if os.getenv("ENABLE_FILE_LOGGING", "false").lower() == "true":
        #     file_handler = logging.FileHandler(log_file_path)
        #     file_handler.setLevel(LOG_LEVEL)
        #     file_handler.setFormatter(formatter)
        #     logger.addHandler(file_handler)
        #     logger.info(f"File logging enabled. Log file: {log_file_path}")

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