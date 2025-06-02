"""
Enhanced evaluations API with IPFS integration via Pinata
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from promptcraft.evaluation.evaluator import Evaluator
from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.logger_config import setup_logger
from promptcraft.schemas.auth_schemas import UserResponse
from api.routers.auth import get_current_active_user
from api.pinata_integration import PinataManager, save_evaluation_to_ipfs
from promptcraft.exceptions import NotFoundException

logger = setup_logger(__name__)

router = APIRouter(
    prefix="/api/v1",
    tags=["evaluations-ipfs"],
)

evaluator = Evaluator()
db_handler = DatabaseHandler()

class EvaluationIPFSRequest(BaseModel):
    task_id: int
    submission_id: Optional[str] = None
    prompt_evaluated: str
    generated_code_evaluated: str | None = None
    evaluation_notes: str
    scores: Dict[str, Any] | None = {}
    save_to_ipfs: bool = True

class EvaluationIPFSResponse(BaseModel):
    evaluation_file: str
    ipfs_hash: Optional[str] = None
    message: str
    evaluator_user_id: int

@router.post("/evaluations-ipfs/candidate/{candidate_id_str}/task/{task_id_int}", 
             response_model=EvaluationIPFSResponse, 
             status_code=status.HTTP_201_CREATED)
async def create_evaluation_with_ipfs(
    candidate_id_str: str,
    task_id_int: int,
    evaluation_data: EvaluationIPFSRequest, 
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Create evaluation and optionally save to IPFS"""
    logger.info(f"Evaluator ID {current_user.id} ({current_user.username}) creating evaluation with IPFS for candidate '{candidate_id_str}', task ID {task_id_int}.")

    # Get task details for evaluation criteria
    task_details = db_handler.get_question_details(task_id_int)
    if not task_details:
        logger.warning(f"Task ID {task_id_int} not found for evaluation by evaluator {current_user.id}.")
        raise NotFoundException(detail=f"Task with ID {task_id_int} not found.")
    
    evaluation_criteria = task_details.get("evaluation_criteria")

    # Create structured evaluation result
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

    ipfs_hash = None
    
    try:
        # Save to local file system (existing functionality)
        evaluator._save_evaluation(structured_evaluation_result)
        filename = f"{evaluator.output_dir}/eval_{candidate_id_str}_task{task_id_int}.json"
        
        # Save to IPFS if requested
        if evaluation_data.save_to_ipfs:
            try:
                ipfs_hash = save_evaluation_to_ipfs(structured_evaluation_result)
                logger.info(f"Evaluation saved to IPFS with hash: {ipfs_hash}")
            except Exception as ipfs_error:
                logger.warning(f"Failed to save to IPFS but local save succeeded: {ipfs_error}")
                # Continue execution - IPFS failure shouldn't break the evaluation
        
        logger.info(f"Evaluation by {current_user.id} for candidate '{candidate_id_str}', task {task_id_int} saved successfully.")
        
    except Exception as e:
        logger.error(f"Failed to save evaluation for candidate '{candidate_id_str}', task {task_id_int} by evaluator {current_user.id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save evaluation: {str(e)}")

    return EvaluationIPFSResponse(
        evaluation_file=filename,
        ipfs_hash=ipfs_hash,
        message="Evaluation recorded successfully" + (" and saved to IPFS" if ipfs_hash else ""),
        evaluator_user_id=current_user.id
    )

@router.get("/evaluations-ipfs/candidate/{candidate_id_str}", response_model=List[Dict])
async def get_evaluations_with_ipfs_info(
    candidate_id_str: str, 
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get evaluations for a candidate with IPFS information if available"""
    logger.info(f"User ID {current_user.id} ({current_user.username}) requesting evaluations with IPFS info for candidate '{candidate_id_str}'.")
    
    try:
        # Get local evaluations
        evaluations = evaluator.get_candidate_evaluations(candidate_id_str)
        
        if not evaluations:
            logger.info(f"No evaluations found for candidate '{candidate_id_str}'.")
            return []
        
        # Try to get IPFS file list to match with local evaluations
        try:
            pinata = PinataManager()
            ipfs_files = pinata.list_pinned_files({
                'type': 'evaluation',
                'candidate_id': candidate_id_str
            })
            
            # Add IPFS information to evaluations if available
            for evaluation in evaluations:
                evaluation['ipfs_available'] = False
                evaluation['ipfs_hash'] = None
                
                # Try to match evaluation with IPFS files
                for file_data in ipfs_files.get('rows', []):
                    metadata = file_data.get('metadata', {}).get('keyvalues', {})
                    if (metadata.get('candidate_id') == candidate_id_str and 
                        str(metadata.get('task_id')) == str(evaluation.get('task_id'))):
                        evaluation['ipfs_available'] = True
                        evaluation['ipfs_hash'] = file_data.get('ipfs_pin_hash')
                        break
                        
        except Exception as ipfs_error:
            logger.warning(f"Failed to get IPFS information: {ipfs_error}")
            # Continue without IPFS info
        
        logger.debug(f"Retrieved {len(evaluations)} evaluations for candidate '{candidate_id_str}'.")
        return evaluations
        
    except Exception as e:
        logger.error(f"Failed to retrieve evaluations for candidate '{candidate_id_str}': {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve evaluations: {str(e)}")

@router.get("/evaluations-ipfs/ipfs/{ipfs_hash}")
async def get_evaluation_from_ipfs(
    ipfs_hash: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Retrieve evaluation data directly from IPFS"""
    logger.info(f"User ID {current_user.id} requesting evaluation from IPFS hash: {ipfs_hash}")
    
    try:
        pinata = PinataManager()
        evaluation_data = pinata.retrieve_data(ipfs_hash)
        
        logger.info(f"Successfully retrieved evaluation from IPFS: {ipfs_hash}")
        return evaluation_data
        
    except Exception as e:
        logger.error(f"Failed to retrieve evaluation from IPFS {ipfs_hash}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Failed to retrieve evaluation from IPFS: {str(e)}")

@router.get("/evaluations-ipfs/list-ipfs-files")
async def list_ipfs_evaluation_files(
    current_user: UserResponse = Depends(get_current_active_user),
    evaluation_type: str = "evaluation"
):
    """List all evaluation files stored in IPFS"""
    logger.info(f"User ID {current_user.id} listing IPFS evaluation files")
    
    try:
        pinata = PinataManager()
        files = pinata.list_pinned_files({'type': evaluation_type})
        
        return {
            'files': files.get('rows', []),
            'count': files.get('count', 0)
        }
        
    except Exception as e:
        logger.error(f"Failed to list IPFS files: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to list IPFS files: {str(e)}")