# api/routers/analytics.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.logger_config import setup_logger
from api.routers.auth import get_current_active_user
from promptcraft.schemas.auth_schemas import UserResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
from enum import Enum

logger = setup_logger(__name__)
router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

db_handler = DatabaseHandler()

class TimePeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class MetricType(str, Enum):
    USERS = "users"
    SUBMISSIONS = "submissions"
    QUESTIONS = "questions"
    ENGAGEMENT = "engagement"

# Pydantic schemas for analytics
class TimeSeriesPoint(BaseModel):
    timestamp: datetime
    value: float
    label: Optional[str] = None

class MetricSummary(BaseModel):
    name: str
    current_value: float
    previous_value: float
    change_percent: float
    trend: str  # "up", "down", "stable"
    unit: str = ""

class UserEngagementMetrics(BaseModel):
    total_users: int
    active_users_today: int
    active_users_week: int
    active_users_month: int
    new_users_today: int
    new_users_week: int
    new_users_month: int
    verified_users: int
    retention_rate: float

class SubmissionMetrics(BaseModel):
    total_submissions: int
    submissions_today: int
    submissions_week: int
    submissions_month: int
    avg_submissions_per_user: float
    avg_code_length: float
    avg_prompt_length: float
    completion_rate: float

class QuestionMetrics(BaseModel):
    total_questions: int
    questions_with_submissions: int
    avg_submissions_per_question: float
    most_popular_question_id: Optional[int] = None
    most_popular_question_title: Optional[str] = None
    difficulty_distribution: Dict[str, int]
    language_distribution: Dict[str, int]

class SystemMetrics(BaseModel):
    database_size: float  # in MB
    avg_response_time: float  # in ms
    error_rate: float  # percentage
    uptime: float  # percentage

class DashboardAnalytics(BaseModel):
    user_engagement: UserEngagementMetrics
    submission_metrics: SubmissionMetrics
    question_metrics: QuestionMetrics
    key_metrics: List[MetricSummary]
    time_series: Dict[str, List[TimeSeriesPoint]]

class DetailedAnalytics(BaseModel):
    period: str
    generated_at: datetime
    metrics: Dict[str, Any]
    charts: Dict[str, List[TimeSeriesPoint]]

@router.get("/dashboard", response_model=DashboardAnalytics)
async def get_dashboard_analytics(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get comprehensive dashboard analytics for admin users."""
    logger.info(f"User {current_user.username} requested dashboard analytics")
    
    try:
        conn = db_handler.connect()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
        cursor = conn.cursor(dictionary=True)
        
        # User Engagement Metrics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN created_at >= CURDATE() THEN 1 ELSE 0 END) as new_users_today,
                SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_users_week,
                SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_month,
                SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_users
            FROM users 
            WHERE is_active = TRUE
        """)
        user_data = cursor.fetchone()
        
        # Active users (users with submissions in time periods)
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT CASE WHEN s.created_at >= CURDATE() THEN s.user_id END) as active_today,
                COUNT(DISTINCT CASE WHEN s.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN s.user_id END) as active_week,
                COUNT(DISTINCT CASE WHEN s.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN s.user_id END) as active_month
            FROM submissions s
        """)
        active_data = cursor.fetchone()
        
        # Submission Metrics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_submissions,
                SUM(CASE WHEN created_at >= CURDATE() THEN 1 ELSE 0 END) as submissions_today,
                SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as submissions_week,
                SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as submissions_month,
                AVG(CASE WHEN generated_code IS NOT NULL THEN LENGTH(generated_code) END) as avg_code_length,
                AVG(LENGTH(prompt)) as avg_prompt_length
            FROM submissions
        """)
        submission_data = cursor.fetchone()
        
        # Question Metrics
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT q.id) as total_questions,
                COUNT(DISTINCT s.question_id) as questions_with_submissions
            FROM questions q
            LEFT JOIN submissions s ON q.id = s.question_id
        """)
        question_data = cursor.fetchone()
        
        # Most popular question
        cursor.execute("""
            SELECT q.id, q.description, COUNT(s.id) as submission_count
            FROM questions q
            LEFT JOIN submissions s ON q.id = s.question_id
            GROUP BY q.id, q.description
            ORDER BY submission_count DESC
            LIMIT 1
        """)
        popular_question = cursor.fetchone()
        
        # Difficulty and language distribution
        cursor.execute("""
            SELECT 
                difficulty_level,
                COUNT(*) as count
            FROM questions 
            WHERE difficulty_level IS NOT NULL
            GROUP BY difficulty_level
        """)
        difficulty_dist = {row['difficulty_level']: row['count'] for row in cursor.fetchall()}
        
        cursor.execute("""
            SELECT 
                programming_language,
                COUNT(*) as count
            FROM questions 
            WHERE programming_language IS NOT NULL
            GROUP BY programming_language
        """)
        language_dist = {row['programming_language']: row['count'] for row in cursor.fetchall()}
        
        # Time series data for submissions (last 30 days)
        cursor.execute("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as submissions
            FROM submissions
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        submission_timeseries = [
            TimeSeriesPoint(
                timestamp=datetime.combine(row['date'], datetime.min.time()),
                value=float(row['submissions']),
                label=str(row['date'])
            )
            for row in cursor.fetchall()
        ]
        
        # Time series data for user registrations (last 30 days)
        cursor.execute("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as new_users
            FROM users
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            AND is_active = TRUE
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        user_timeseries = [
            TimeSeriesPoint(
                timestamp=datetime.combine(row['date'], datetime.min.time()),
                value=float(row['new_users']),
                label=str(row['date'])
            )
            for row in cursor.fetchall()
        ]
        
        # Calculate derived metrics
        avg_submissions_per_user = (
            submission_data['total_submissions'] / user_data['total_users']
            if user_data['total_users'] > 0 else 0
        )
        
        avg_submissions_per_question = (
            submission_data['total_submissions'] / question_data['total_questions']
            if question_data['total_questions'] > 0 else 0
        )
        
        completion_rate = (
            (question_data['questions_with_submissions'] / question_data['total_questions']) * 100
            if question_data['total_questions'] > 0 else 0
        )
        
        retention_rate = (
            (active_data['active_month'] / user_data['total_users']) * 100
            if user_data['total_users'] > 0 else 0
        )
        
        # Key metrics with trends (simplified - using week-over-week comparison)
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as current_week,
                COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) 
                          AND created_at < DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as previous_week
            FROM submissions
        """)
        submission_trends = cursor.fetchone()
        
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as current_week,
                COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) 
                          AND created_at < DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as previous_week
            FROM users 
            WHERE is_active = TRUE
        """)
        user_trends = cursor.fetchone()
        
        def calculate_trend(current, previous):
            if previous == 0:
                return 100.0 if current > 0 else 0.0, "up" if current > 0 else "stable"
            change = ((current - previous) / previous) * 100
            trend = "up" if change > 5 else "down" if change < -5 else "stable"
            return change, trend
        
        sub_change, sub_trend = calculate_trend(
            submission_trends['current_week'], 
            submission_trends['previous_week']
        )
        user_change, user_trend = calculate_trend(
            user_trends['current_week'], 
            user_trends['previous_week']
        )
        
        key_metrics = [
            MetricSummary(
                name="Weekly Submissions",
                current_value=float(submission_trends['current_week']),
                previous_value=float(submission_trends['previous_week']),
                change_percent=sub_change,
                trend=sub_trend,
                unit="submissions"
            ),
            MetricSummary(
                name="New Users",
                current_value=float(user_trends['current_week']),
                previous_value=float(user_trends['previous_week']),
                change_percent=user_change,
                trend=user_trend,
                unit="users"
            ),
            MetricSummary(
                name="Completion Rate",
                current_value=completion_rate,
                previous_value=completion_rate,  # Simplified
                change_percent=0.0,
                trend="stable",
                unit="%"
            ),
            MetricSummary(
                name="User Retention",
                current_value=retention_rate,
                previous_value=retention_rate,  # Simplified
                change_percent=0.0,
                trend="stable",
                unit="%"
            )
        ]
        
        cursor.close()
        db_handler.close()
        
        return DashboardAnalytics(
            user_engagement=UserEngagementMetrics(
                total_users=user_data['total_users'],
                active_users_today=active_data['active_today'] or 0,
                active_users_week=active_data['active_week'] or 0,
                active_users_month=active_data['active_month'] or 0,
                new_users_today=user_data['new_users_today'],
                new_users_week=user_data['new_users_week'],
                new_users_month=user_data['new_users_month'],
                verified_users=user_data['verified_users'],
                retention_rate=round(retention_rate, 1)
            ),
            submission_metrics=SubmissionMetrics(
                total_submissions=submission_data['total_submissions'],
                submissions_today=submission_data['submissions_today'],
                submissions_week=submission_data['submissions_week'],
                submissions_month=submission_data['submissions_month'],
                avg_submissions_per_user=round(avg_submissions_per_user, 1),
                avg_code_length=round(submission_data['avg_code_length'] or 0, 1),
                avg_prompt_length=round(submission_data['avg_prompt_length'] or 0, 1),
                completion_rate=round(completion_rate, 1)
            ),
            question_metrics=QuestionMetrics(
                total_questions=question_data['total_questions'],
                questions_with_submissions=question_data['questions_with_submissions'],
                avg_submissions_per_question=round(avg_submissions_per_question, 1),
                most_popular_question_id=popular_question['id'] if popular_question else None,
                most_popular_question_title=popular_question['description'][:100] if popular_question else None,
                difficulty_distribution=difficulty_dist,
                language_distribution=language_dist
            ),
            key_metrics=key_metrics,
            time_series={
                "submissions": submission_timeseries,
                "new_users": user_timeseries
            }
        )
        
    except Exception as e:
        logger.error(f"Error getting dashboard analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics data")

@router.get("/metrics/{metric_type}")
async def get_specific_metrics(
    metric_type: MetricType,
    period: TimePeriod = Query(TimePeriod.MONTHLY),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get specific metric data with time series information."""
    logger.info(f"User {current_user.username} requested {metric_type} metrics for {period}")
    
    try:
        conn = db_handler.connect()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
        cursor = conn.cursor(dictionary=True)
        
        # Set default date range if not provided
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            if period == TimePeriod.DAILY:
                start_date = end_date - timedelta(days=30)
            elif period == TimePeriod.WEEKLY:
                start_date = end_date - timedelta(weeks=12)
            elif period == TimePeriod.MONTHLY:
                start_date = end_date - timedelta(days=365)
            else:  # YEARLY
                start_date = end_date - timedelta(days=365*3)
        
        # Define time grouping based on period
        time_format = {
            TimePeriod.DAILY: "DATE(created_at)",
            TimePeriod.WEEKLY: "YEARWEEK(created_at)",
            TimePeriod.MONTHLY: "DATE_FORMAT(created_at, '%Y-%m')",
            TimePeriod.YEARLY: "YEAR(created_at)"
        }
        
        if metric_type == MetricType.USERS:
            query = f"""
                SELECT 
                    {time_format[period]} as period,
                    COUNT(*) as value,
                    MIN(created_at) as timestamp
                FROM users
                WHERE created_at BETWEEN %s AND %s
                AND is_active = TRUE
                GROUP BY {time_format[period]}
                ORDER BY period
            """
        elif metric_type == MetricType.SUBMISSIONS:
            query = f"""
                SELECT 
                    {time_format[period]} as period,
                    COUNT(*) as value,
                    MIN(created_at) as timestamp
                FROM submissions
                WHERE created_at BETWEEN %s AND %s
                GROUP BY {time_format[period]}
                ORDER BY period
            """
        elif metric_type == MetricType.QUESTIONS:
            # For questions, we'll show submission activity by question
            query = f"""
                SELECT 
                    {time_format[period]} as period,
                    COUNT(DISTINCT question_id) as value,
                    MIN(s.created_at) as timestamp
                FROM submissions s
                WHERE s.created_at BETWEEN %s AND %s
                GROUP BY {time_format[period]}
                ORDER BY period
            """
        else:  # ENGAGEMENT
            query = f"""
                SELECT 
                    {time_format[period]} as period,
                    COUNT(DISTINCT user_id) as value,
                    MIN(created_at) as timestamp
                FROM submissions
                WHERE created_at BETWEEN %s AND %s
                GROUP BY {time_format[period]}
                ORDER BY period
            """
        
        cursor.execute(query, (start_date, end_date))
        results = cursor.fetchall()
        
        time_series = [
            TimeSeriesPoint(
                timestamp=row['timestamp'],
                value=float(row['value']),
                label=str(row['period'])
            )
            for row in results
        ]
        
        cursor.close()
        db_handler.close()
        
        return {
            "metric_type": metric_type,
            "period": period,
            "start_date": start_date,
            "end_date": end_date,
            "data_points": len(time_series),
            "time_series": time_series
        }
        
    except Exception as e:
        logger.error(f"Error getting {metric_type} metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve {metric_type} metrics")

@router.get("/export")
async def export_analytics(
    format: str = Query("json", regex="^(json|csv)$"),
    metric_types: List[MetricType] = Query([MetricType.USERS, MetricType.SUBMISSIONS]),
    period: TimePeriod = Query(TimePeriod.MONTHLY),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Export analytics data in JSON or CSV format."""
    logger.info(f"User {current_user.username} requested analytics export in {format} format")
    
    try:
        # Get dashboard analytics as base data
        dashboard_data = await get_dashboard_analytics(current_user)
        
        export_data = {
            "generated_at": datetime.now().isoformat(),
            "generated_by": current_user.username,
            "period": period,
            "dashboard_analytics": dashboard_data.dict()
        }
        
        # Add specific metrics for each requested type
        for metric_type in metric_types:
            metric_data = await get_specific_metrics(metric_type, period, None, None, current_user)
            export_data[f"{metric_type}_time_series"] = metric_data
        
        if format == "csv":
            # For CSV, we'll return a simplified structure
            # In a real implementation, you'd use pandas or csv module
            return {
                "message": "CSV export not implemented in this demo",
                "data": export_data
            }
        
        return export_data
        
    except Exception as e:
        logger.error(f"Error exporting analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to export analytics data")

@router.get("/health")
async def analytics_health_check():
    """Health check endpoint for analytics service."""
    try:
        conn = db_handler.connect()
        if not conn:
            raise HTTPException(status_code=503, detail="Database connection failed")
        
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        db_handler.close()
        
        return {
            "status": "healthy",
            "service": "analytics",
            "timestamp": datetime.now().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Analytics health check failed: {e}")
        raise HTTPException(status_code=503, detail="Analytics service unhealthy")