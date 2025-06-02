from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime

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

evaluator = Evaluator(use_database=True)
db_handler = DatabaseHandler()

class EvaluationRequestData(BaseModel):
    task_id: int
    submission_id: Optional[int] = None
    prompt_evaluated: str
    generated_code_evaluated: str | None = None
    evaluation_notes: str
    scores: Dict[str, Any] | None = {}
    overall_score: Optional[float] = None

class EvaluationResponse(BaseModel):
    evaluation_id: int
    message: str
    evaluator_user_id: int

class EvaluationDetailResponse(BaseModel):
    id: int
    candidate_id: str
    task_id: int
    submission_id: Optional[int]
    evaluator_user_id: int
    evaluator_username: str
    prompt_evaluated: str
    generated_code_evaluated: Optional[str]
    evaluation_notes: str
    evaluation_criteria_used: Optional[Dict[str, Any]]
    scores: Optional[Dict[str, Any]]
    overall_score: Optional[float]
    status: str
    created_at: datetime
    updated_at: datetime
    task_description: Optional[str] = None
    programming_language: Optional[str] = None
    difficulty_level: Optional[str] = None
    evaluator_full_name: Optional[str] = None

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

    # Validate task exists
    task_details = db_handler.get_question_details(task_id_int)
    if not task_details:
        logger.warning(f"Task ID {task_id_int} not found for evaluation by evaluator {current_user.id}.")
        raise NotFoundException(detail=f"Task with ID {task_id_int} not found.")
    
    evaluation_criteria = task_details.get("evaluation_criteria")

    try:
        # Use the new structured evaluation method
        evaluation_id = evaluator.create_evaluation_structured(
            candidate_id=candidate_id_str,
            task_id=task_id_int,
            evaluator_user_id=current_user.id,
            evaluator_username=current_user.username,
            prompt_evaluated=evaluation_data.prompt_evaluated,
            generated_code_evaluated=evaluation_data.generated_code_evaluated,
            evaluation_notes=evaluation_data.evaluation_notes,
            evaluation_criteria_used=evaluation_criteria,
            scores=evaluation_data.scores,
            submission_id=evaluation_data.submission_id,
            overall_score=evaluation_data.overall_score
        )
        
        if evaluation_id:
            logger.info(f"Evaluation created with ID {evaluation_id} by {current_user.id} for candidate '{candidate_id_str}', task {task_id_int}.")
        else:
            logger.error(f"Failed to create evaluation for candidate '{candidate_id_str}', task {task_id_int}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create evaluation")
            
    except Exception as e:
        logger.error(f"Failed to save evaluation for candidate '{candidate_id_str}', task {task_id_int} by evaluator {current_user.id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save evaluation: {str(e)}")

    return EvaluationResponse(
        evaluation_id=evaluation_id,
        message="Evaluation recorded successfully.",
        evaluator_user_id=current_user.id
    )

@router.get("/evaluations/candidate/{candidate_id_str}", response_model=List[EvaluationDetailResponse])
async def get_evaluations_for_candidate_api(
    candidate_id_str: str,
    limit: int = Query(50, ge=1, le=100, description="Number of evaluations to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get all evaluations for a specific candidate with pagination."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting evaluations for candidate '{candidate_id_str}'.")
    try:
        evaluations = evaluator.get_candidate_evaluations(candidate_id_str, limit=limit, offset=offset)
        if not evaluations:
            logger.info(f"No evaluations found for candidate '{candidate_id_str}'.")
            return []
        logger.debug(f"Retrieved {len(evaluations)} evaluations for candidate '{candidate_id_str}'.")
        return evaluations
    except Exception as e:
        logger.error(f"Failed to retrieve evaluations for candidate '{candidate_id_str}': {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve evaluations: {str(e)}")

@router.get("/evaluations/{evaluation_id}", response_model=EvaluationDetailResponse)
async def get_evaluation_by_id(
    evaluation_id: int,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get a specific evaluation by ID."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting evaluation {evaluation_id}.")
    try:
        evaluation = evaluator.get_evaluation_by_id(evaluation_id)
        if not evaluation:
            logger.warning(f"Evaluation {evaluation_id} not found.")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evaluation {evaluation_id} not found")
        logger.debug(f"Retrieved evaluation {evaluation_id}.")
        return evaluation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve evaluation {evaluation_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve evaluation: {str(e)}")

@router.get("/evaluations/task/{task_id}", response_model=List[EvaluationDetailResponse])
async def get_evaluations_by_task(
    task_id: int,
    limit: int = Query(50, ge=1, le=100, description="Number of evaluations to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get all evaluations for a specific task."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting evaluations for task {task_id}.")
    try:
        evaluations = evaluator.get_evaluations_by_task(task_id, limit=limit, offset=offset)
        logger.debug(f"Retrieved {len(evaluations)} evaluations for task {task_id}.")
        return evaluations
    except Exception as e:
        logger.error(f"Failed to retrieve evaluations for task {task_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve evaluations: {str(e)}")

@router.get("/evaluations/evaluator/{evaluator_user_id}", response_model=List[EvaluationDetailResponse])
async def get_evaluations_by_evaluator(
    evaluator_user_id: int,
    limit: int = Query(50, ge=1, le=100, description="Number of evaluations to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get all evaluations by a specific evaluator."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting evaluations by evaluator {evaluator_user_id}.")
    try:
        evaluations = evaluator.get_evaluations_by_evaluator(evaluator_user_id, limit=limit, offset=offset)
        logger.debug(f"Retrieved {len(evaluations)} evaluations by evaluator {evaluator_user_id}.")
        return evaluations
    except Exception as e:
        logger.error(f"Failed to retrieve evaluations by evaluator {evaluator_user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve evaluations: {str(e)}")

@router.get("/evaluations/my-evaluations", response_model=List[EvaluationDetailResponse])
async def get_my_evaluations(
    limit: int = Query(50, ge=1, le=100, description="Number of evaluations to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get all evaluations made by the current user."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting their own evaluations.")
    try:
        evaluations = evaluator.get_evaluations_by_evaluator(current_user.id, limit=limit, offset=offset)
        logger.debug(f"Retrieved {len(evaluations)} evaluations by current user {current_user.id}.")
        return evaluations
    except Exception as e:
        logger.error(f"Failed to retrieve evaluations by current user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve evaluations: {str(e)}")

@router.put("/evaluations/{evaluation_id}", response_model=EvaluationDetailResponse)
async def update_evaluation(
    evaluation_id: int,
    evaluation_notes: Optional[str] = None,
    scores: Optional[Dict[str, Any]] = None,
    overall_score: Optional[float] = None,
    status: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Update an existing evaluation."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) updating evaluation {evaluation_id}.")
    
    # First check if evaluation exists and belongs to current user
    existing_evaluation = evaluator.get_evaluation_by_id(evaluation_id)
    if not existing_evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evaluation {evaluation_id} not found")
    
    if existing_evaluation['evaluator_user_id'] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own evaluations")
    
    try:
        # Build update data
        update_data = {}
        if evaluation_notes is not None:
            update_data['evaluation_notes'] = evaluation_notes
        if scores is not None:
            update_data['scores'] = scores
        if overall_score is not None:
            update_data['overall_score'] = overall_score
        if status is not None:
            update_data['status'] = status
        
        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")
        
        success = evaluator.update_evaluation(evaluation_id, **update_data)
        if not success:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update evaluation")
        
        # Return updated evaluation
        updated_evaluation = evaluator.get_evaluation_by_id(evaluation_id)
        logger.info(f"Evaluation {evaluation_id} updated successfully by user {current_user.id}.")
        return updated_evaluation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update evaluation {evaluation_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update evaluation: {str(e)}")

@router.delete("/evaluations/{evaluation_id}")
async def delete_evaluation(
    evaluation_id: int,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Delete an evaluation (admin only or evaluation owner)."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) attempting to delete evaluation {evaluation_id}.")
    
    # First check if evaluation exists
    existing_evaluation = evaluator.get_evaluation_by_id(evaluation_id)
    if not existing_evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evaluation {evaluation_id} not found")
    
    # Check if user can delete (owner or admin - you might want to add admin role check)
    if existing_evaluation['evaluator_user_id'] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own evaluations")
    
    try:
        success = evaluator.delete_evaluation(evaluation_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete evaluation")
        
        logger.info(f"Evaluation {evaluation_id} deleted successfully by user {current_user.id}.")
        return {"message": f"Evaluation {evaluation_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete evaluation {evaluation_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete evaluation: {str(e)}")

@router.get("/evaluations/statistics", response_model=Dict[str, Any])
async def get_evaluation_statistics(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get evaluation statistics."""
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting evaluation statistics.")
    try:
        stats = evaluator.get_evaluation_statistics()
        logger.debug(f"Retrieved evaluation statistics for user {current_user.id}.")
        return stats
    except Exception as e:
        logger.error(f"Failed to retrieve evaluation statistics: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve statistics: {str(e)}") 