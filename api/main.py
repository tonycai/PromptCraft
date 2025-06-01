from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from api.routers import questions, submissions, evaluations, auth # Added auth router
from promptcraft.exceptions import PromptCraftBaseException # Import base custom exception
from promptcraft.logger_config import setup_logger # Import logger
from promptcraft.error_handlers import setup_error_handlers
from promptcraft.middleware import setup_middleware

logger = setup_logger(__name__) # Setup logger for main API module

app = FastAPI(
    title="PromptCraft API",
    description="API for PromptCraft, a framework for assessing prompting proficiency.",
    version="0.2.0" # Example version
)

# Setup middleware (must be done before app starts)
setup_middleware(app)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://promptcraft.aiw3.ai"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Global Exception Handler for our custom exceptions
@app.exception_handler(PromptCraftBaseException)
async def promptcraft_exception_handler(request: Request, exc: PromptCraftBaseException):
    logger.error(f"Custom application error: {exc.detail}", exc_info=True) # Log with stack trace
    return JSONResponse(
        status_code=exc.status_code,
        content={"error_type": exc.__class__.__name__, "detail": exc.detail},
    )

# Global Exception Handler for unhandled Python exceptions
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.critical(f"Unhandled server error: {exc}", exc_info=True) # Log with stack trace
    return JSONResponse(
        status_code=500,
        content={"error_type": "InternalServerError", "detail": "An unexpected internal server error occurred."},
    )

@app.on_event("startup")
async def startup_event():
    logger.info("PromptCraft API starting up...")
    # Setup error handlers (middleware already set up above)
    setup_error_handlers(app)
    logger.info("Error handlers configured")
    # You can initialize DB connections, Redis connections here if using FastAPI dependencies
    # For now, they are initialized globally in their respective modules or when first used.

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("PromptCraft API shutting down...")
    # Clean up resources here if needed (e.g., close DB pools)

@app.get("/", tags=["Root"])
async def read_root():
    """Root endpoint providing a welcome message."""
    return {"message": "Welcome to the PromptCraft API"}

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    # Basic health check. Can be expanded to check DB, Redis connectivity.
    # For example, check redis_cache.is_connected() and db_handler.connect() (without making a full query)
    return {"status": "healthy"}

app.include_router(questions.router) # Include the questions router
app.include_router(submissions.router) # Include the submissions router
app.include_router(evaluations.router) # Include the evaluations router
app.include_router(auth.router) # Added authentication router

# Placeholder for future routers
# from . import evaluations_router
# app.include_router(evaluations_router.router)

if __name__ == "__main__":
    import uvicorn
    logger.info("Running API directly with Uvicorn...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_config=None) # uvicorn handles its own logging based on its config 