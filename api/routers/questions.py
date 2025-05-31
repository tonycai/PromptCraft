from fastapi import APIRouter, HTTPException, Depends
from typing import List
from promptcraft.database.db_handler import DatabaseHandler
from pydantic import BaseModel
from promptcraft.redis_cache import RedisCache
from promptcraft.logger_config import setup_logger # Import logger setup
from promptcraft.exceptions import NotFoundException, CacheException # Import custom exceptions

logger = setup_logger(__name__) # Setup logger for this module

router = APIRouter(
    prefix="/api/v1",
    tags=["questions"],
)

# Initialize DatabaseHandler & RedisCache (Singleton). 
# Consider FastAPI dependency injection for these for better testability and management.
db_handler = DatabaseHandler()
redis_cache = RedisCache()

CACHE_TTL_SECONDS = 300 # 5 minutes
CACHE_PREFIX_QUESTIONS = "promptcraft:questions"

class QuestionBase(BaseModel):
    id: int
    description: str

class QuestionDetail(QuestionBase):
    expected_outcome: str | None = None
    evaluation_criteria: List[str] = []
    programming_language: str | None = None
    difficulty_level: str | None = None

@router.get("/questions", response_model=List[QuestionBase])
async def get_all_questions_api():
    cache_key = f"{CACHE_PREFIX_QUESTIONS}:all"
    logger.debug(f"Attempting to get all questions. Cache key: {cache_key}")
    try:
        cached_questions = redis_cache.get(cache_key)
        if cached_questions is not None:
            logger.info("Serving all questions from cache.")
            return [QuestionBase(**q) for q in cached_questions]
    except Exception as e: # More specific CacheException could be raised by RedisCache
        logger.error(f"Error retrieving all questions from cache: {e}. Cache key: {cache_key}")
        # Potentially raise CacheException here if RedisCache indicates a connection issue
        # For now, falling through to DB

    logger.info("Fetching all questions from DB as not found in cache or cache error.")
    try:
        questions_from_db = db_handler.get_all_questions()
    except Exception as e: # More specific DatabaseException could be raised by DatabaseHandler
        logger.error(f"Database error while fetching all questions: {e}")
        raise NotFoundException(detail="Could not retrieve questions at this time due to a database issue.") # Or a 503 type

    if not questions_from_db:
        logger.info("No questions found in DB.")
        return []
    
    response_questions = [QuestionBase(**q) for q in questions_from_db]
    try:
        if not redis_cache.set(cache_key, [q.model_dump() for q in response_questions], ttl_seconds=CACHE_TTL_SECONDS):
            logger.warning(f"Failed to set all questions to cache. Key: {cache_key}")
    except Exception as e:
        logger.error(f"Error setting all questions to cache: {e}. Key: {cache_key}")
        # Don't fail the request if caching fails
    return response_questions

@router.get("/questions/{question_id}", response_model=QuestionDetail)
async def get_question_details_api(question_id: int):
    cache_key = f"{CACHE_PREFIX_QUESTIONS}:details:{question_id}"
    logger.debug(f"Attempting to get question details for ID {question_id}. Cache key: {cache_key}")
    try:
        cached_detail = redis_cache.get(cache_key)
        if cached_detail is not None:
            logger.info(f"Serving question details for ID {question_id} from cache.")
            return QuestionDetail(**cached_detail)
    except Exception as e:
        logger.error(f"Error retrieving question ID {question_id} from cache: {e}. Cache key: {cache_key}")
        # Fall through

    logger.info(f"Fetching question details for ID {question_id} from DB.")
    try:
        details_from_db = db_handler.get_question_details(question_id)
    except Exception as e:
        logger.error(f"Database error while fetching question ID {question_id}: {e}")
        raise NotFoundException(detail=f"Could not retrieve question {question_id} due to a database issue.")

    if not details_from_db:
        logger.warning(f"Question with ID {question_id} not found in DB.")
        # Use our custom NotFoundException
        raise NotFoundException(detail=f"Question with ID {question_id} not found")
    
    response_detail = QuestionDetail(**details_from_db)
    try:
        if not redis_cache.set(cache_key, response_detail.model_dump(), ttl_seconds=CACHE_TTL_SECONDS):
            logger.warning(f"Failed to set question ID {question_id} to cache. Key: {cache_key}")
    except Exception as e:
        logger.error(f"Error setting question ID {question_id} to cache: {e}. Key: {cache_key}")
    return response_detail

# TODO: Add logging to other routers (submissions, evaluations)
# TODO: Implement cache invalidation for POST/PUT/DELETE operations on questions.
# Consider adding a cache invalidation mechanism if questions can be added/updated via API
# For example, on POST/PUT/DELETE to questions, delete relevant cache keys.
# @router.post("/questions") or similar would need:
#   redis_cache.delete(f"{CACHE_PREFIX_QUESTIONS}:all")
#   redis_cache.delete(f"{CACHE_PREFIX_QUESTIONS}:details:{new_question_id}") 