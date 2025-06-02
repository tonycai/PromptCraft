# api/routers/leaderboard.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.logger_config import setup_logger
from api.routers.auth import get_current_active_user
from promptcraft.schemas.auth_schemas import UserResponse
from pydantic import BaseModel
from datetime import datetime, timedelta

logger = setup_logger(__name__)
router = APIRouter(prefix="/api/v1/leaderboard", tags=["leaderboard"])

db_handler = DatabaseHandler()

# Pydantic schemas for leaderboard
class LeaderboardEntry(BaseModel):
    user_id: int
    username: str
    full_name: Optional[str] = None
    profile_photo_url: Optional[str] = None
    rank: int
    score: float
    total_submissions: int
    completed_questions: int
    avg_score: float
    recent_activity: Optional[datetime] = None
    badge: Optional[str] = None  # "🥇", "🥈", "🥉", etc.

class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    total_users: int
    current_user_rank: Optional[int] = None
    current_user_entry: Optional[LeaderboardEntry] = None
    
class UserStats(BaseModel):
    user_id: int
    username: str
    total_submissions: int
    completed_questions: int
    avg_score: float
    best_score: float
    recent_submissions: int
    streak_days: int
    rank: int
    percentile: float

@router.get("/", response_model=LeaderboardResponse)
async def get_leaderboard(
    limit: int = Query(50, ge=1, le=100, description="Number of entries to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    period: str = Query("all_time", regex="^(all_time|monthly|weekly)$", description="Time period for leaderboard"),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get the leaderboard with user rankings based on submission scores."""
    logger.info(f"User {current_user.username} requested leaderboard (limit: {limit}, offset: {offset}, period: {period})")
    
    try:
        # Get time filter based on period
        time_filter = ""
        if period == "weekly":
            time_filter = "AND s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        elif period == "monthly":
            time_filter = "AND s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        
        # Main leaderboard query with calculated scores
        leaderboard_query = f"""
            SELECT 
                u.id as user_id,
                u.username,
                u.full_name,
                u.profile_photo_url,
                COUNT(DISTINCT s.id) as total_submissions,
                COUNT(DISTINCT s.question_id) as completed_questions,
                COALESCE(AVG(
                    CASE 
                        WHEN LENGTH(s.generated_code) > 0 THEN 
                            LEAST(100, GREATEST(0, 
                                50 + (LENGTH(s.generated_code) / 100) + 
                                (CHAR_LENGTH(s.prompt) / 20)
                            ))
                        ELSE 30
                    END
                ), 0) as avg_score,
                MAX(s.created_at) as recent_activity
            FROM users u
            LEFT JOIN submissions s ON u.id = s.user_id {time_filter}
            WHERE u.is_active = TRUE AND u.is_verified = TRUE
            GROUP BY u.id, u.username, u.full_name, u.profile_photo_url
            HAVING total_submissions > 0
            ORDER BY avg_score DESC, total_submissions DESC, completed_questions DESC
            LIMIT %s OFFSET %s
        """
        
        conn = db_handler.connect()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute(leaderboard_query, (limit, offset))
        results = cursor.fetchall()
        
        # Calculate ranks and add badges
        entries = []
        for idx, row in enumerate(results):
            rank = offset + idx + 1
            badge = None
            if rank == 1:
                badge = "🥇"
            elif rank == 2:
                badge = "🥈"
            elif rank == 3:
                badge = "🥉"
            elif rank <= 10:
                badge = "⭐"
            
            entry = LeaderboardEntry(
                user_id=row['user_id'],
                username=row['username'],
                full_name=row['full_name'],
                profile_photo_url=row['profile_photo_url'],
                rank=rank,
                score=round(row['avg_score'], 1),
                total_submissions=row['total_submissions'],
                completed_questions=row['completed_questions'],
                avg_score=round(row['avg_score'], 1),
                recent_activity=row['recent_activity'],
                badge=badge
            )
            entries.append(entry)
        
        # Get total user count
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE is_active = TRUE AND is_verified = TRUE")
        total_users = cursor.fetchone()['total']
        
        # Get current user's rank and entry
        current_user_rank = None
        current_user_entry = None
        
        # Simplified user rank query for MySQL compatibility
        user_rank_query = f"""
            SELECT 
                u.id as user_id,
                u.username,
                u.full_name,
                u.profile_photo_url,
                COUNT(DISTINCT s.id) as total_submissions,
                COUNT(DISTINCT s.question_id) as completed_questions,
                COALESCE(AVG(
                    CASE 
                        WHEN LENGTH(s.generated_code) > 0 THEN 
                            LEAST(100, GREATEST(0, 
                                50 + (LENGTH(s.generated_code) / 100) + 
                                (CHAR_LENGTH(s.prompt) / 20)
                            ))
                        ELSE 30
                    END
                ), 0) as avg_score,
                MAX(s.created_at) as recent_activity
            FROM users u
            LEFT JOIN submissions s ON u.id = s.user_id {time_filter}
            WHERE u.is_active = TRUE AND u.is_verified = TRUE AND u.id = %s
            GROUP BY u.id, u.username, u.full_name, u.profile_photo_url
            HAVING total_submissions > 0
        """
        
        cursor.execute(user_rank_query, (current_user.id,))
        user_rank_result = cursor.fetchone()
        
        if user_rank_result:
            # Calculate rank by counting users with higher scores
            rank_calc_query = f"""
                SELECT COUNT(*) + 1 as rank
                FROM (
                    SELECT 
                        COALESCE(AVG(
                            CASE 
                                WHEN LENGTH(s.generated_code) > 0 THEN 
                                    LEAST(100, GREATEST(0, 
                                        50 + (LENGTH(s.generated_code) / 100) + 
                                        (CHAR_LENGTH(s.prompt) / 20)
                                    ))
                                ELSE 30
                            END
                        ), 0) as avg_score
                    FROM users u
                    LEFT JOIN submissions s ON u.id = s.user_id {time_filter}
                    WHERE u.is_active = TRUE AND u.is_verified = TRUE
                    GROUP BY u.id
                    HAVING COUNT(DISTINCT s.id) > 0 AND avg_score > %s
                ) better_users
            """
            cursor.execute(rank_calc_query, (user_rank_result['avg_score'],))
            rank_result = cursor.fetchone()
            current_user_rank = rank_result['rank'] if rank_result else 1
            current_user_entry = LeaderboardEntry(
                user_id=user_rank_result['user_id'],
                username=user_rank_result['username'],
                full_name=user_rank_result['full_name'],
                profile_photo_url=user_rank_result['profile_photo_url'],
                rank=current_user_rank,
                score=round(user_rank_result['avg_score'], 1),
                total_submissions=user_rank_result['total_submissions'],
                completed_questions=user_rank_result['completed_questions'],
                avg_score=round(user_rank_result['avg_score'], 1),
                recent_activity=user_rank_result['recent_activity'],
                badge="🎯"  # Special badge for current user
            )
        
        cursor.close()
        db_handler.close()
        
        logger.info(f"Leaderboard returned {len(entries)} entries for user {current_user.username}")
        
        return LeaderboardResponse(
            entries=entries,
            total_users=total_users,
            current_user_rank=current_user_rank,
            current_user_entry=current_user_entry
        )
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve leaderboard")

@router.get("/stats/{user_id}", response_model=UserStats)
async def get_user_stats(
    user_id: int,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get detailed statistics for a specific user."""
    logger.info(f"User {current_user.username} requested stats for user {user_id}")
    
    try:
        conn = db_handler.connect()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
        cursor = conn.cursor(dictionary=True)
        
        # Get user stats
        stats_query = """
            SELECT 
                u.id as user_id,
                u.username,
                COUNT(DISTINCT s.id) as total_submissions,
                COUNT(DISTINCT s.question_id) as completed_questions,
                COALESCE(AVG(
                    CASE 
                        WHEN LENGTH(s.generated_code) > 0 THEN 
                            LEAST(100, GREATEST(0, 
                                50 + (LENGTH(s.generated_code) / 100) + 
                                (CHAR_LENGTH(s.prompt) / 20)
                            ))
                        ELSE 30
                    END
                ), 0) as avg_score,
                COALESCE(MAX(
                    CASE 
                        WHEN LENGTH(s.generated_code) > 0 THEN 
                            LEAST(100, GREATEST(0, 
                                50 + (LENGTH(s.generated_code) / 100) + 
                                (CHAR_LENGTH(s.prompt) / 20)
                            ))
                        ELSE 30
                    END
                ), 0) as best_score,
                COUNT(CASE WHEN s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_submissions
            FROM users u
            LEFT JOIN submissions s ON u.id = s.user_id
            WHERE u.id = %s AND u.is_active = TRUE
            GROUP BY u.id, u.username
        """
        
        cursor.execute(stats_query, (user_id,))
        user_stats = cursor.fetchone()
        
        if not user_stats:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate streak (simplified - consecutive days with submissions)
        streak_query = """
            SELECT COUNT(DISTINCT DATE(created_at)) as streak_days
            FROM submissions 
            WHERE user_id = %s 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        """
        cursor.execute(streak_query, (user_id,))
        streak_result = cursor.fetchone()
        streak_days = streak_result['streak_days'] if streak_result else 0
        
        # Get user rank
        rank_query = """
            SELECT COUNT(*) + 1 as rank
            FROM (
                SELECT u.id,
                    COALESCE(AVG(
                        CASE 
                            WHEN LENGTH(s.generated_code) > 0 THEN 
                                LEAST(100, GREATEST(0, 
                                    50 + (LENGTH(s.generated_code) / 100) + 
                                    (CHAR_LENGTH(s.prompt) / 20)
                                ))
                            ELSE 30
                        END
                    ), 0) as avg_score
                FROM users u
                LEFT JOIN submissions s ON u.id = s.user_id
                WHERE u.is_active = TRUE AND u.is_verified = TRUE
                GROUP BY u.id
                HAVING avg_score > %s
            ) better_users
        """
        cursor.execute(rank_query, (user_stats['avg_score'],))
        rank_result = cursor.fetchone()
        rank = rank_result['rank'] if rank_result else 1
        
        # Calculate percentile
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE is_active = TRUE AND is_verified = TRUE")
        total_users = cursor.fetchone()['total']
        percentile = round(((total_users - rank + 1) / total_users) * 100, 1) if total_users > 0 else 0
        
        cursor.close()
        db_handler.close()
        
        return UserStats(
            user_id=user_stats['user_id'],
            username=user_stats['username'],
            total_submissions=user_stats['total_submissions'],
            completed_questions=user_stats['completed_questions'],
            avg_score=round(user_stats['avg_score'], 1),
            best_score=round(user_stats['best_score'], 1),
            recent_submissions=user_stats['recent_submissions'],
            streak_days=streak_days,
            rank=rank,
            percentile=percentile
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user statistics")

@router.get("/my-stats", response_model=UserStats)
async def get_my_stats(current_user: UserResponse = Depends(get_current_active_user)):
    """Get detailed statistics for the current user."""
    return await get_user_stats(current_user.id, current_user)