from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from promptcraft.evaluation.evaluator import Evaluator
from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.logger_config import setup_logger
from promptcraft.schemas.auth_schemas import UserResponse
from api.routers.auth import get_current_active_user
from promptcraft.exceptions import NotFoundException

logger = setup_logger(__name__)

router = APIRouter(
    prefix="/api/v1",
    tags=["evaluations"],
)

evaluator = Evaluator()
db_handler = DatabaseHandler()

class EvaluationRequestData(BaseModel):
    task_id: int
    submission_id: Optional[str] = None
    prompt_evaluated: str
    generated_code_evaluated: str | None = None
    evaluation_notes: str
    scores: Dict[str, Any] | None = {}

class EvaluationResponse(BaseModel):
    evaluation_file: str
    message: str
    evaluator_user_id: int

@router.post("/evaluations/candidate/{candidate_id_str}/task/{task_id_int}", 
             response_model=EvaluationResponse, 
             status_code=status.HTTP_201_CREATED)
async def create_evaluation_for_candidate_submission(
    candidate_id_str: str,
    task_id_int: int,
    evaluation_data: EvaluationRequestData, 
    current_user: UserResponse = Depends(get_current_active_user)
):
    logger.info(f"Evaluator ID {current_user.id} ({current_user.username}) creating evaluation for candidate '{candidate_id_str}', task ID {task_id_int}.")

    task_details = db_handler.get_question_details(task_id_int)
    if not task_details:
        logger.warning(f"Task ID {task_id_int} not found for evaluation by evaluator {current_user.id}.")
        raise NotFoundException(detail=f"Task with ID {task_id_int} not found.")
    evaluation_criteria = task_details.get("evaluation_criteria")

    structured_evaluation_result = {
        "candidate_id": candidate_id_str,
        "task_id": task_id_int,
        "evaluator_user_id": current_user.id,
        "evaluator_username": current_user.username,
        "submission_id": evaluation_data.submission_id,
        "prompt_evaluated": evaluation_data.prompt_evaluated,
        "generated_code_evaluated": evaluation_data.generated_code_evaluated,
        "evaluation_notes": evaluation_data.evaluation_notes,
        "evaluation_criteria_used": evaluation_criteria,
        "scores": evaluation_data.scores
    }

    try:
        evaluator._save_evaluation(structured_evaluation_result)
        filename = f"{evaluator.output_dir}/eval_{candidate_id_str}_task{task_id_int}.json"
        logger.info(f"Evaluation by {current_user.id} for candidate '{candidate_id_str}', task {task_id_int} saved to {filename}.")
    except Exception as e:
        logger.error(f"Failed to save evaluation for candidate '{candidate_id_str}', task {task_id_int} by evaluator {current_user.id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save evaluation: {str(e)}")

    return EvaluationResponse(
        evaluation_file=filename,
        message="Evaluation recorded successfully.",
        evaluator_user_id=current_user.id
    )

@router.get("/evaluations/candidate/{candidate_id_str}", response_model=List[Dict])
async def get_evaluations_for_candidate_api(
    candidate_id_str: str, 
    current_user: UserResponse = Depends(get_current_active_user)
):
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting evaluations for candidate '{candidate_id_str}'.")
    try:
        evaluations = evaluator.get_candidate_evaluations(candidate_id_str)
        if not evaluations:
            logger.info(f"No evaluations found for candidate '{candidate_id_str}'.")
            return []
        logger.debug(f"Retrieved {len(evaluations)} evaluations for candidate '{candidate_id_str}'.")
        return evaluations
    except Exception as e:
        logger.error(f"Failed to retrieve evaluations for candidate '{candidate_id_str}': {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve evaluations: {str(e)}")

# TODO: Refactor Evaluator class:
# - `evaluate_submission` method should not use `input()`.
# - It should accept all necessary data as parameters (candidate_id, task_id, prompt, code, criteria, notes, scores).
# - The API endpoint can then call this refactored method instead of the private `_save_evaluation`. 