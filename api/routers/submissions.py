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

from promptcraft.tasks.task_handler import TaskHandler
from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.logger_config import setup_logger
from promptcraft.schemas.auth_schemas import UserResponse
from api.routers.auth import get_current_active_user
from promptcraft.exceptions import NotFoundException

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

task_handler = TaskHandler()
db_handler = DatabaseHandler()

class SubmissionRequest(BaseModel):
    task_id: int
    prompt: str

class SubmissionResponse(BaseModel):
    submission_file: str
    generated_code: str
    message: str
    submitted_by_user_id: int

@router.post("/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_submission_api(
    submission: SubmissionRequest, 
    current_user: UserResponse = Depends(get_current_active_user)
):
    logger.info(f"User ID {current_user.id} ({current_user.username}) creating submission for task ID {submission.task_id}.")
    
    task_details = db_handler.get_question_details(submission.task_id)
    if not task_details:
        logger.warning(f"Task ID {submission.task_id} not found for submission by user {current_user.id}.")
        raise NotFoundException(detail=f"Task with ID {submission.task_id} not found.")

    generated_code = llm_response_or_simulate(submission.prompt)

    try:
        submission_file = task_handler.record_submission(
            candidate_id=f"user_{current_user.id}_{current_user.username}",
            task_id=submission.task_id,
            prompt=submission.prompt,
            generated_code=generated_code
        )
        logger.info(f"Submission by user {current_user.id} for task {submission.task_id} recorded to {submission_file}.")
    except Exception as e:
        logger.error(f"Failed to record submission for user {current_user.id}, task {submission.task_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to record submission: {str(e)}")

    return SubmissionResponse(
        submission_file=submission_file,
        generated_code=generated_code,
        message="Submission processed and recorded successfully.",
        submitted_by_user_id=current_user.id
    ) 