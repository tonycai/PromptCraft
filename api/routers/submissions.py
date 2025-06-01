from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict

# Need to make get_llm_response accessible, e.g., by moving it to a utility module
# For now, let's assume it can be imported or we'll define a similar one here.
# from promptcraft.utils import get_llm_response 
# Or, we can copy the logic for now if it's simple enough and not yet refactored.

# Simulating get_llm_response if not refactored yet.
# This should be replaced with the actual OpenAI call logic from cli.py or a shared util.
import os
from openai import OpenAI

# from promptcraft.tasks.task_handler import TaskHandler  # No longer needed for database-only storage
from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.logger_config import setup_logger
from promptcraft.schemas.auth_schemas import UserResponse
from api.routers.auth import get_current_active_user
from promptcraft.exceptions import NotFoundException
from promptcraft.error_handlers import (
    DatabaseError, 
    ExternalServiceError, 
    NotFoundError, 
    ValidationError
)

logger = setup_logger(__name__)

# LLM Client Setup (copied from previous, ideally in a shared util)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
llm_client = None
if OPENAI_API_KEY:
    llm_client = OpenAI(api_key=OPENAI_API_KEY)
    logger.info("OpenAI client initialized for submissions router.")
else:
    logger.warning("OPENAI_API_KEY not set. LLM calls in submissions router will be simulated.")

def llm_response_or_simulate(prompt: str):
    if not llm_client:
        logger.info(f"Simulating LLM response for prompt: '{prompt[:30]}...'")
        lower = prompt.lower()
        if "factorial" in lower: return "```python\ndef factorial(n):\n    if n < 0: raise ValueError(\"Factorial not defined for negative numbers\")\n    if n in (0, 1): return 1\n    return n * factorial(n - 1)\n```"
        if "sort" in lower and "array" in lower: return "```javascript\nfunction sortByProperty(array, property) {\n  return array.sort((a, b) => (a[property] > b[property] ? 1 : -1));\n}\n```"
        if "sql" in lower and "top 5" in lower: return "```sql\nSELECT customer_id, SUM(amount) AS total_spent\nFROM purchases\nGROUP BY customer_id\nORDER BY total_spent DESC\nLIMIT 5;\n```"
        return "```\n-- Simulated LLM response (API key missing or OpenAI client error)\n```"
    try:
        logger.info(f"Sending prompt to OpenAI: '{prompt[:30]}...'")
        completion = llm_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        response_content = completion.choices[0].message.content
        logger.info("Received response from OpenAI.")
        return response_content
    except Exception as e:
        logger.error(f"Error during OpenAI API call: {e}", exc_info=True)
        logger.warning("Falling back to simulated LLM response due to OpenAI API error.")
        return "```\n-- Simulated LLM response (OpenAI API error occurred)\n```"

router = APIRouter(
    prefix="/api/v1",
    tags=["submissions"],
)

db_handler = DatabaseHandler()

class SubmissionRequest(BaseModel):
    task_id: int
    prompt: str

class SubmissionResponse(BaseModel):
    submission_id: int
    generated_code: str
    message: str
    submitted_by_user_id: int

class SubmissionHistoryItem(BaseModel):
    id: int
    question_id: int
    question_description: str
    prompt: str
    generated_code: str
    created_at: str
    updated_at: str

class SubmissionHistoryResponse(BaseModel):
    submissions: list[SubmissionHistoryItem]
    total_count: int
    page: int
    limit: int

@router.post("/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_submission_api(
    submission: SubmissionRequest, 
    current_user: UserResponse = Depends(get_current_active_user)
):
    logger.info(f"User ID {current_user.id} ({current_user.username}) creating submission for task ID {submission.task_id}.")
    
    try:
        task_details = db_handler.get_question_details(submission.task_id)
        if not task_details:
            logger.warning(f"Task ID {submission.task_id} not found for submission by user {current_user.id}.")
            raise NotFoundError(f"Task with ID {submission.task_id} not found.")
    except Exception as e:
        logger.error(f"Database error while fetching task details: {e}")
        raise DatabaseError("Failed to retrieve task details", {"task_id": submission.task_id})

    generated_code = llm_response_or_simulate(submission.prompt)

    # Save to database only
    try:
        submission_id = db_handler.create_submission(
            user_id=current_user.id,
            question_id=submission.task_id,
            prompt=submission.prompt,
            generated_code=generated_code,
            submission_file=None  # No file storage
        )
        if not submission_id:
            logger.error(f"Failed to create database submission record for user {current_user.id}, task {submission.task_id}")
            raise DatabaseError(
                "Failed to save submission to database", 
                {"user_id": current_user.id, "task_id": submission.task_id}
            )
        
        logger.info(f"Submission by user {current_user.id} for task {submission.task_id} saved to database with ID: {submission_id}.")
    except DatabaseError:
        raise  # Re-raise custom database errors
    except Exception as e:
        logger.error(f"Unexpected error saving submission for user {current_user.id}, task {submission.task_id}: {e}", exc_info=True)
        raise DatabaseError(
            "Unexpected database error occurred", 
            {"user_id": current_user.id, "task_id": submission.task_id, "error": str(e)}
        )

    return SubmissionResponse(
        submission_id=submission_id,
        generated_code=generated_code,
        message="Submission processed and recorded successfully.",
        submitted_by_user_id=current_user.id
    )

@router.get("/submissions/my", response_model=SubmissionHistoryResponse)
async def get_my_submissions(
    page: int = 1,
    limit: int = 20,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get submission history for the current user."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting submission history.")
    
    if limit > 100:
        limit = 100  # Cap the limit to prevent excessive data retrieval
    
    offset = (page - 1) * limit
    
    try:
        submissions = db_handler.get_user_submissions(current_user.id, limit, offset)
        total_count = db_handler.get_user_submission_count(current_user.id)
        
        # Convert datetime objects to strings for JSON serialization
        submission_items = []
        for sub in submissions:
            submission_items.append(SubmissionHistoryItem(
                id=sub['id'],
                question_id=sub['question_id'],
                question_description=sub['question_description'],
                prompt=sub['prompt'],
                generated_code=sub['generated_code'] or "",
                created_at=sub['created_at'].isoformat() if sub['created_at'] else "",
                updated_at=sub['updated_at'].isoformat() if sub['updated_at'] else ""
            ))
        
        logger.info(f"Retrieved {len(submission_items)} submissions for user {current_user.id} (page {page}, limit {limit})")
        
        return SubmissionHistoryResponse(
            submissions=submission_items,
            total_count=total_count,
            page=page,
            limit=limit
        )
    except Exception as e:
        logger.error(f"Failed to retrieve submissions for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve submission history")

@router.get("/submissions/{submission_id}", response_model=SubmissionHistoryItem)
async def get_submission_by_id(
    submission_id: int,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get a specific submission by ID (only if it belongs to the current user)."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting submission {submission_id}.")
    
    try:
        submission = db_handler.get_submission_by_id(submission_id)
        
        if not submission:
            logger.warning(f"Submission {submission_id} not found.")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
        
        # Ensure user can only access their own submissions
        if submission['user_id'] != current_user.id:
            logger.warning(f"User {current_user.id} attempted to access submission {submission_id} belonging to user {submission['user_id']}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        return SubmissionHistoryItem(
            id=submission['id'],
            question_id=submission['question_id'],
            question_description=submission['question_description'],
            prompt=submission['prompt'],
            generated_code=submission['generated_code'] or "",
            created_at=submission['created_at'].isoformat() if submission['created_at'] else "",
            updated_at=submission['updated_at'].isoformat() if submission['updated_at'] else ""
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve submission {submission_id} for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve submission") 