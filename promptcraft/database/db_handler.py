"""
Database handler for PromptCraft, now using MySQL.
"""
import mysql.connector
from mysql.connector import Error, IntegrityError # Added IntegrityError for unique constraint violations
import json
import os
from promptcraft.logger_config import setup_logger # Import the logger
from typing import Dict, Any, Optional # For type hinting

logger = setup_logger(__name__) # Get a logger for this module

class DatabaseHandler:
    """Handles all database operations for PromptCraft using MySQL."""
    
    def __init__(self):
        """Initialize the database handler with MySQL connection parameters from environment variables."""
        self.db_host = os.getenv("MYSQL_HOST", "localhost")
        self.db_user = os.getenv("MYSQL_USER", "promptcraft_user")
        self.db_password = os.getenv("MYSQL_PASSWORD", "promptcraft_password")
        self.db_name = os.getenv("MYSQL_DATABASE", "promptcraft_db")
        self.db_port = int(os.getenv("MYSQL_PORT", 3306)) # Default MySQL port
        self.conn = None
        logger.info(f"DatabaseHandler initialized for {self.db_user}@{self.db_host}:{self.db_port}/{self.db_name}")
        # Attempt to ensure DB exists. This is a bit tricky on init.
        # Might be better to call this explicitly from init scripts.
        # self.ensure_database_exists() 

    def _connect_to_server(self):
        """Connects to the MySQL server without specifying a database."""
        try:
            conn = mysql.connector.connect(
                host=self.db_host,
                user=self.db_user,
                password=self.db_password,
                port=self.db_port,
                auth_plugin='caching_sha2_password'
            )
            logger.debug(f"Successfully connected to MySQL server at {self.db_host}:{self.db_port}")
            return conn
        except Error as e:
            logger.error(f"Error connecting to MySQL server: {e}")
            raise 

    def ensure_database_exists(self):
        """Ensures the database exists, creating it if necessary."""
        conn = None
        cursor = None
        try:
            conn = self._connect_to_server()
            if conn.is_connected():
                cursor = conn.cursor()
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                logger.info(f"Database '{self.db_name}' ensured to exist.")
        except Error as e:
            logger.error(f"Error ensuring database '{self.db_name}' exists: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn and conn.is_connected():
                conn.close()

    def connect(self):
        """Connect to the MySQL database."""
        if self.conn and self.conn.is_connected():
            return self.conn
        try:
            self.conn = mysql.connector.connect(
                host=self.db_host,
                user=self.db_user,
                password=self.db_password,
                database=self.db_name,
                port=self.db_port,
                auth_plugin='caching_sha2_password'
            )
            if self.conn.is_connected():
                logger.debug(f"Successfully connected to database '{self.db_name}'.")
                return self.conn
            else: # Should not happen if connect doesn't raise error
                self.conn = None
                return None
        except Error as e:
            logger.error(f"Error connecting to database '{self.db_name}': {e}")
            self.conn = None 
            return None

    def close(self):
        """Close the database connection."""
        if self.conn and self.conn.is_connected():
            self.conn.close()
            self.conn = None
            logger.debug("Database connection closed.")

    def initialize_tables(self):
        """Initialize the database tables if they don't exist."""
        self.ensure_database_exists() # Make sure DB exists before creating tables
        conn = self.connect()
        if not conn:
            logger.error("Failed to connect to database for table initialization.")
            return

        cursor = conn.cursor()
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS questions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    description TEXT NOT NULL,
                    expected_outcome TEXT,
                    evaluation_criteria JSON,
                    programming_language VARCHAR(50),
                    difficulty_level VARCHAR(50)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS exam_questions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guide_section TEXT,
                    question_text TEXT NOT NULL,
                    answer_text TEXT,
                    question_type VARCHAR(50) DEFAULT 'short-answer'
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    hashed_password VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100),
                    profile_photo_url TEXT,
                    profile_photo_ipfs_hash VARCHAR(255),
                    is_active BOOLEAN DEFAULT TRUE,
                    is_verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS email_verification_tokens (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    token VARCHAR(255) NOT NULL UNIQUE,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS submissions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    question_id INT NOT NULL,
                    prompt TEXT NOT NULL,
                    generated_code TEXT,
                    submission_file VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
                    INDEX idx_user_question (user_id, question_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS evaluations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    candidate_id VARCHAR(255) NOT NULL,
                    task_id INT NOT NULL,
                    submission_id INT NULL,
                    evaluator_user_id INT NOT NULL,
                    evaluator_username VARCHAR(50) NOT NULL,
                    prompt_evaluated TEXT NOT NULL,
                    generated_code_evaluated TEXT,
                    evaluation_notes TEXT NOT NULL,
                    evaluation_criteria_used JSON,
                    scores JSON,
                    overall_score DECIMAL(5,2) DEFAULT NULL,
                    status ENUM('pending', 'completed', 'reviewed') DEFAULT 'completed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES questions(id) ON DELETE CASCADE,
                    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE SET NULL,
                    FOREIGN KEY (evaluator_user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_candidate_task (candidate_id, task_id),
                    INDEX idx_evaluator (evaluator_user_id),
                    INDEX idx_submission (submission_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            
            # Add profile photo columns if they don't exist (migration)
            try:
                cursor.execute("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
                    ADD COLUMN IF NOT EXISTS profile_photo_ipfs_hash VARCHAR(255)
                """)
                logger.info("Profile photo columns added to users table (if they didn't exist).")
            except Error as e:
                # This might fail on some MySQL versions that don't support IF NOT EXISTS in ALTER TABLE
                # Let's try a different approach
                try:
                    cursor.execute("DESCRIBE users")
                    columns = [row[0] for row in cursor.fetchall()]
                    
                    if 'profile_photo_url' not in columns:
                        cursor.execute("ALTER TABLE users ADD COLUMN profile_photo_url TEXT")
                        logger.info("Added profile_photo_url column to users table.")
                    
                    if 'profile_photo_ipfs_hash' not in columns:
                        cursor.execute("ALTER TABLE users ADD COLUMN profile_photo_ipfs_hash VARCHAR(255)")
                        logger.info("Added profile_photo_ipfs_hash column to users table.")
                        
                except Error as migration_error:
                    logger.warning(f"Could not add profile photo columns (they may already exist): {migration_error}")
            
            conn.commit()
            logger.info(f"Tables in database '{self.db_name}' initialized.")
        except Error as e:
            logger.error(f"Error initializing tables: {e}")
            conn.rollback() 
        finally:
            cursor.close()
            self.close()
            
    def add_question(self, description, expected_outcome=None, evaluation_criteria=None,
                     programming_language=None, difficulty_level=None):
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor()
        question_id = None
        try:
            sql = """
                INSERT INTO questions (description, expected_outcome, evaluation_criteria,
                                       programming_language, difficulty_level)
                VALUES (%s, %s, %s, %s, %s)
            """
            ec_json = json.dumps(evaluation_criteria) if evaluation_criteria is not None else None
            cursor.execute(sql, (description, expected_outcome, ec_json,
                                  programming_language, difficulty_level))
            conn.commit()
            question_id = cursor.lastrowid
            logger.info(f"Question added with ID: {question_id}")
        except Error as e:
            logger.error(f"Error adding question: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
        return question_id

    def get_all_questions(self):
        conn = self.connect()
        if not conn: return []
        cursor = conn.cursor(dictionary=True) 
        questions = []
        try:
            cursor.execute("SELECT id, description FROM questions")
            questions = cursor.fetchall()
            logger.debug(f"Retrieved {len(questions)} questions.")
        except Error as e:
            logger.error(f"Error retrieving all questions: {e}")
        finally:
            cursor.close()
            self.close()
        return questions

    def get_question_details(self, question_id):
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor(dictionary=True) 
        details = None
        try:
            cursor.execute("""
                SELECT id, description, expected_outcome, evaluation_criteria,
                       programming_language, difficulty_level
                FROM questions
                WHERE id = %s
            """, (question_id,))
            result = cursor.fetchone()
            if result:
                if result.get('evaluation_criteria') and isinstance(result['evaluation_criteria'], (str, bytes, bytearray)):
                    try:
                        result['evaluation_criteria'] = json.loads(result['evaluation_criteria'])
                    except json.JSONDecodeError as json_err:
                        logger.warning(f"JSON decode error for evaluation_criteria in question ID {question_id}: {json_err}")
                        result['evaluation_criteria'] = [] 
                elif not result.get('evaluation_criteria'):
                     result['evaluation_criteria'] = []
                details = result
                logger.debug(f"Retrieved details for question ID {question_id}")
            else:
                logger.warning(f"No details found for question ID {question_id}")
        except Error as e:
            logger.error(f"Error retrieving question details for ID {question_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return details

    def add_exam_question(self, guide_section, question_text, answer_text=None, question_type='short-answer'):
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor()
        exam_question_id = None
        try:
            sql = """
                INSERT INTO exam_questions (guide_section, question_text, answer_text, question_type)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (guide_section, question_text, answer_text, question_type))
            conn.commit()
            exam_question_id = cursor.lastrowid
            logger.info(f"Exam question added with ID: {exam_question_id}")
        except Error as e:
            logger.error(f"Error adding exam question: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
        return exam_question_id

    def clear_exam_questions(self):
        conn = self.connect()
        if not conn:
            logger.error("Failed to connect to database for clearing exam questions.")
            return
        cursor = conn.cursor()
        try:
            # It's safer to check if table exists or use TRUNCATE TABLE if appropriate
            cursor.execute("DELETE FROM exam_questions") # This deletes all rows
            # For full reset: cursor.execute("TRUNCATE TABLE exam_questions")
            conn.commit()
            logger.info("Exam questions table cleared.")
        except Error as e:
            logger.error(f"Error clearing exam_questions table: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close() 

    # New methods for User model
    def create_user(self, email: str, username: str, hashed_password: str, full_name: Optional[str] = None) -> Optional[int]:
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor()
        user_id = None
        try:
            sql = """
                INSERT INTO users (email, username, hashed_password, full_name, is_active, is_verified)
                VALUES (%s, %s, %s, %s, TRUE, FALSE) 
            """
            cursor.execute(sql, (email, username, hashed_password, full_name))
            conn.commit()
            user_id = cursor.lastrowid
            logger.info(f"User created with ID: {user_id}, username: {username}, email: {email}")
        except IntegrityError as ie:
            logger.warning(f"Failed to create user. IntegrityError (e.g., email/username already exists): {ie}")
            conn.rollback()
            # Re-raise or return a specific value/error code if needed
            # For now, returns None, caller should check
        except Error as e:
            logger.error(f"Error creating user {username}: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
        return user_id

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor(dictionary=True)
        user_data = None
        try:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            if user_data:
                logger.debug(f"User found by email: {email}")
            else:
                logger.debug(f"No user found with email: {email}")
        except Error as e:
            logger.error(f"Error getting user by email {email}: {e}")
        finally:
            cursor.close()
            self.close()
        return user_data

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor(dictionary=True)
        user_data = None
        try:
            cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
            user_data = cursor.fetchone()
            if user_data:
                logger.debug(f"User found by username: {username}")
            else:
                logger.debug(f"No user found with username: {username}")
        except Error as e:
            logger.error(f"Error getting user by username {username}: {e}")
        finally:
            cursor.close()
            self.close()
        return user_data

    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor(dictionary=True)
        user_data = None
        try:
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user_data = cursor.fetchone()
            if user_data:
                logger.debug(f"User found by ID: {user_id}")
            else:
                logger.debug(f"No user found with ID: {user_id}")
        except Error as e:
            logger.error(f"Error getting user by ID {user_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return user_data

    def update_user(self, user_id: int, **kwargs) -> bool:
        """Update user fields. Accepts any combination of updateable fields."""
        conn = self.connect()
        if not conn: 
            return False
        
        cursor = conn.cursor()
        updated = False
        
        # Define allowed fields for update
        allowed_fields = {
            'full_name', 'profile_photo_url', 'profile_photo_ipfs_hash', 
            'email', 'username'  # Add email/username if needed, but be careful with uniqueness
        }
        
        # Filter kwargs to only include allowed fields that are not None
        update_fields = {k: v for k, v in kwargs.items() 
                        if k in allowed_fields and v is not None}
        
        if not update_fields:
            logger.warning(f"No valid fields provided for user {user_id} update.")
            self.close()
            return False
        
        try:
            # Build dynamic SQL
            set_clauses = [f"{field} = %s" for field in update_fields.keys()]
            sql = f"""
                UPDATE users 
                SET {', '.join(set_clauses)}, updated_at = CURRENT_TIMESTAMP 
                WHERE id = %s
            """
            
            # Prepare values (field values + user_id)
            values = list(update_fields.values()) + [user_id]
            
            cursor.execute(sql, values)
            conn.commit()
            
            if cursor.rowcount > 0:
                logger.info(f"User ID {user_id} updated successfully. Fields: {list(update_fields.keys())}")
                updated = True
            else:
                logger.warning(f"Attempted to update user ID {user_id}, but user not found or no change needed.")
                
        except Error as e:
            logger.error(f"Error updating user ID {user_id}: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
            
        return updated

    # Add methods for email verification tokens
    def create_email_verification_token(self, user_id: int, token: str, expires_at: str) -> Optional[int]:
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor()
        token_id = None
        try:
            sql = "INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (%s, %s, %s)"
            cursor.execute(sql, (user_id, token, expires_at))
            conn.commit()
            token_id = cursor.lastrowid
            logger.info(f"Email verification token created for user_id: {user_id}")
        except Error as e:
            logger.error(f"Error creating email verification token for user_id {user_id}: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
        return token_id

    def get_email_verification_token(self, token: str) -> Optional[Dict[str, Any]]:
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor(dictionary=True)
        token_data = None
        try:
            sql = "SELECT * FROM email_verification_tokens WHERE token = %s"
            cursor.execute(sql, (token,))
            token_data = cursor.fetchone()
        except Error as e:
            logger.error(f"Error getting email verification token {token}: {e}")
        finally:
            cursor.close()
            self.close()
        return token_data

    def set_user_verified(self, user_id: int) -> bool:
        conn = self.connect()
        if not conn: return False
        cursor = conn.cursor()
        updated = False
        try:
            sql = "UPDATE users SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
            cursor.execute(sql, (user_id,))
            conn.commit()
            if cursor.rowcount > 0:
                logger.info(f"User ID {user_id} marked as verified.")
                updated = True
            else:
                logger.warning(f"Attempted to mark user ID {user_id} as verified, but user not found or no change needed.")
        except Error as e:
            logger.error(f"Error setting user ID {user_id} as verified: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
        return updated

    def delete_email_verification_token(self, token: str) -> bool:
        conn = self.connect()
        if not conn: return False
        cursor = conn.cursor()
        deleted = False
        try:
            sql = "DELETE FROM email_verification_tokens WHERE token = %s"
            cursor.execute(sql, (token,))
            conn.commit()
            if cursor.rowcount > 0:
                logger.info(f"Email verification token {token} deleted.")
                deleted = True
        except Error as e:
            logger.error(f"Error deleting email verification token {token}: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
        return deleted

    # Submission methods
    def create_submission(self, user_id: int, question_id: int, prompt: str, 
                         generated_code: Optional[str] = None, submission_file: Optional[str] = None) -> Optional[int]:
        """Create a new submission record."""
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor()
        submission_id = None
        try:
            sql = """
                INSERT INTO submissions (user_id, question_id, prompt, generated_code, submission_file)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (user_id, question_id, prompt, generated_code, submission_file))
            conn.commit()
            submission_id = cursor.lastrowid
            logger.info(f"Submission created with ID: {submission_id} for user {user_id}, question {question_id}")
        except Error as e:
            logger.error(f"Error creating submission for user {user_id}, question {question_id}: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
        return submission_id

    def get_user_submissions(self, user_id: int, limit: int = 50, offset: int = 0) -> list:
        """Get all submissions for a specific user."""
        conn = self.connect()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        submissions = []
        try:
            sql = """
                SELECT s.*, q.description as question_description
                FROM submissions s
                JOIN questions q ON s.question_id = q.id
                WHERE s.user_id = %s
                ORDER BY s.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(sql, (user_id, limit, offset))
            submissions = cursor.fetchall()
            logger.debug(f"Retrieved {len(submissions)} submissions for user {user_id}")
        except Error as e:
            logger.error(f"Error getting submissions for user {user_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return submissions

    def get_question_submissions(self, question_id: int, limit: int = 50, offset: int = 0) -> list:
        """Get all submissions for a specific question."""
        conn = self.connect()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        submissions = []
        try:
            sql = """
                SELECT s.*, u.username, u.email
                FROM submissions s
                JOIN users u ON s.user_id = u.id
                WHERE s.question_id = %s
                ORDER BY s.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(sql, (question_id, limit, offset))
            submissions = cursor.fetchall()
            logger.debug(f"Retrieved {len(submissions)} submissions for question {question_id}")
        except Error as e:
            logger.error(f"Error getting submissions for question {question_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return submissions

    def get_submission_by_id(self, submission_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific submission by ID."""
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor(dictionary=True)
        submission = None
        try:
            sql = """
                SELECT s.*, q.description as question_description, u.username, u.email
                FROM submissions s
                JOIN questions q ON s.question_id = q.id
                JOIN users u ON s.user_id = u.id
                WHERE s.id = %s
            """
            cursor.execute(sql, (submission_id,))
            submission = cursor.fetchone()
            if submission:
                logger.debug(f"Retrieved submission {submission_id}")
            else:
                logger.debug(f"No submission found with ID {submission_id}")
        except Error as e:
            logger.error(f"Error getting submission {submission_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return submission

    def get_user_submission_count(self, user_id: int) -> int:
        """Get total number of submissions for a user."""
        conn = self.connect()
        if not conn: return 0
        cursor = conn.cursor()
        count = 0
        try:
            cursor.execute("SELECT COUNT(*) FROM submissions WHERE user_id = %s", (user_id,))
            result = cursor.fetchone()
            count = result[0] if result else 0
            logger.debug(f"User {user_id} has {count} submissions")
        except Error as e:
            logger.error(f"Error getting submission count for user {user_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return count

    # Evaluation methods
    def create_evaluation(self, candidate_id: str, task_id: int, evaluator_user_id: int, 
                         evaluator_username: str, prompt_evaluated: str, 
                         generated_code_evaluated: Optional[str] = None, 
                         evaluation_notes: str = "", evaluation_criteria_used: Optional[Dict[str, Any]] = None,
                         scores: Optional[Dict[str, Any]] = None, submission_id: Optional[int] = None,
                         overall_score: Optional[float] = None, status: str = "completed") -> Optional[int]:
        """Create a new evaluation record."""
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor()
        evaluation_id = None
        try:
            sql = """
                INSERT INTO evaluations (
                    candidate_id, task_id, submission_id, evaluator_user_id, evaluator_username,
                    prompt_evaluated, generated_code_evaluated, evaluation_notes, 
                    evaluation_criteria_used, scores, overall_score, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            # Convert dicts to JSON strings
            criteria_json = json.dumps(evaluation_criteria_used) if evaluation_criteria_used else None
            scores_json = json.dumps(scores) if scores else None
            
            cursor.execute(sql, (
                candidate_id, task_id, submission_id, evaluator_user_id, evaluator_username,
                prompt_evaluated, generated_code_evaluated, evaluation_notes,
                criteria_json, scores_json, overall_score, status
            ))
            conn.commit()
            evaluation_id = cursor.lastrowid
            logger.info(f"Evaluation created with ID: {evaluation_id} for candidate {candidate_id}, task {task_id}")
        except Error as e:
            logger.error(f"Error creating evaluation for candidate {candidate_id}, task {task_id}: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
        return evaluation_id

    def get_candidate_evaluations(self, candidate_id: str, limit: int = 50, offset: int = 0) -> list:
        """Get all evaluations for a specific candidate."""
        conn = self.connect()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        evaluations = []
        try:
            sql = """
                SELECT 
                    e.*,
                    q.description as task_description,
                    q.programming_language,
                    q.difficulty_level,
                    u.username as evaluator_username_full,
                    u.full_name as evaluator_full_name
                FROM evaluations e
                LEFT JOIN questions q ON e.task_id = q.id
                LEFT JOIN users u ON e.evaluator_user_id = u.id
                WHERE e.candidate_id = %s
                ORDER BY e.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(sql, (candidate_id, limit, offset))
            results = cursor.fetchall()
            
            for evaluation in results:
                # Parse JSON fields
                if evaluation.get('evaluation_criteria_used') and isinstance(evaluation['evaluation_criteria_used'], str):
                    try:
                        evaluation['evaluation_criteria_used'] = json.loads(evaluation['evaluation_criteria_used'])
                    except json.JSONDecodeError:
                        evaluation['evaluation_criteria_used'] = {}
                
                if evaluation.get('scores') and isinstance(evaluation['scores'], str):
                    try:
                        evaluation['scores'] = json.loads(evaluation['scores'])
                    except json.JSONDecodeError:
                        evaluation['scores'] = {}
                
                evaluations.append(evaluation)
            
            logger.debug(f"Retrieved {len(evaluations)} evaluations for candidate {candidate_id}")
        except Error as e:
            logger.error(f"Error getting evaluations for candidate {candidate_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return evaluations

    def get_evaluation_by_id(self, evaluation_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific evaluation by ID."""
        conn = self.connect()
        if not conn: return None
        cursor = conn.cursor(dictionary=True)
        evaluation = None
        try:
            sql = """
                SELECT 
                    e.*,
                    q.description as task_description,
                    q.programming_language,
                    q.difficulty_level,
                    u.username as evaluator_username_full,
                    u.full_name as evaluator_full_name
                FROM evaluations e
                LEFT JOIN questions q ON e.task_id = q.id
                LEFT JOIN users u ON e.evaluator_user_id = u.id
                WHERE e.id = %s
            """
            cursor.execute(sql, (evaluation_id,))
            evaluation = cursor.fetchone()
            
            if evaluation:
                # Parse JSON fields
                if evaluation.get('evaluation_criteria_used') and isinstance(evaluation['evaluation_criteria_used'], str):
                    try:
                        evaluation['evaluation_criteria_used'] = json.loads(evaluation['evaluation_criteria_used'])
                    except json.JSONDecodeError:
                        evaluation['evaluation_criteria_used'] = {}
                
                if evaluation.get('scores') and isinstance(evaluation['scores'], str):
                    try:
                        evaluation['scores'] = json.loads(evaluation['scores'])
                    except json.JSONDecodeError:
                        evaluation['scores'] = {}
                
                logger.debug(f"Retrieved evaluation {evaluation_id}")
            else:
                logger.debug(f"No evaluation found with ID {evaluation_id}")
        except Error as e:
            logger.error(f"Error getting evaluation {evaluation_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return evaluation

    def get_evaluations_by_task(self, task_id: int, limit: int = 50, offset: int = 0) -> list:
        """Get all evaluations for a specific task."""
        conn = self.connect()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        evaluations = []
        try:
            sql = """
                SELECT 
                    e.*,
                    q.description as task_description,
                    u.username as evaluator_username_full,
                    u.full_name as evaluator_full_name
                FROM evaluations e
                LEFT JOIN questions q ON e.task_id = q.id
                LEFT JOIN users u ON e.evaluator_user_id = u.id
                WHERE e.task_id = %s
                ORDER BY e.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(sql, (task_id, limit, offset))
            results = cursor.fetchall()
            
            for evaluation in results:
                # Parse JSON fields
                if evaluation.get('evaluation_criteria_used') and isinstance(evaluation['evaluation_criteria_used'], str):
                    try:
                        evaluation['evaluation_criteria_used'] = json.loads(evaluation['evaluation_criteria_used'])
                    except json.JSONDecodeError:
                        evaluation['evaluation_criteria_used'] = {}
                
                if evaluation.get('scores') and isinstance(evaluation['scores'], str):
                    try:
                        evaluation['scores'] = json.loads(evaluation['scores'])
                    except json.JSONDecodeError:
                        evaluation['scores'] = {}
                
                evaluations.append(evaluation)
            
            logger.debug(f"Retrieved {len(evaluations)} evaluations for task {task_id}")
        except Error as e:
            logger.error(f"Error getting evaluations for task {task_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return evaluations

    def get_evaluations_by_evaluator(self, evaluator_user_id: int, limit: int = 50, offset: int = 0) -> list:
        """Get all evaluations by a specific evaluator."""
        conn = self.connect()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        evaluations = []
        try:
            sql = """
                SELECT 
                    e.*,
                    q.description as task_description,
                    q.programming_language,
                    q.difficulty_level
                FROM evaluations e
                LEFT JOIN questions q ON e.task_id = q.id
                WHERE e.evaluator_user_id = %s
                ORDER BY e.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(sql, (evaluator_user_id, limit, offset))
            results = cursor.fetchall()
            
            for evaluation in results:
                # Parse JSON fields
                if evaluation.get('evaluation_criteria_used') and isinstance(evaluation['evaluation_criteria_used'], str):
                    try:
                        evaluation['evaluation_criteria_used'] = json.loads(evaluation['evaluation_criteria_used'])
                    except json.JSONDecodeError:
                        evaluation['evaluation_criteria_used'] = {}
                
                if evaluation.get('scores') and isinstance(evaluation['scores'], str):
                    try:
                        evaluation['scores'] = json.loads(evaluation['scores'])
                    except json.JSONDecodeError:
                        evaluation['scores'] = {}
                
                evaluations.append(evaluation)
            
            logger.debug(f"Retrieved {len(evaluations)} evaluations by evaluator {evaluator_user_id}")
        except Error as e:
            logger.error(f"Error getting evaluations by evaluator {evaluator_user_id}: {e}")
        finally:
            cursor.close()
            self.close()
        return evaluations

    def update_evaluation(self, evaluation_id: int, **kwargs) -> bool:
        """Update evaluation fields."""
        conn = self.connect()
        if not conn: return False
        
        cursor = conn.cursor()
        updated = False
        
        # Define allowed fields for update
        allowed_fields = {
            'evaluation_notes', 'scores', 'overall_score', 'status', 
            'evaluation_criteria_used', 'prompt_evaluated', 'generated_code_evaluated'
        }
        
        # Filter kwargs to only include allowed fields that are not None
        update_fields = {k: v for k, v in kwargs.items() 
                        if k in allowed_fields and v is not None}
        
        if not update_fields:
            logger.warning(f"No valid fields provided for evaluation {evaluation_id} update.")
            self.close()
            return False
        
        try:
            # Handle JSON fields
            if 'scores' in update_fields and isinstance(update_fields['scores'], dict):
                update_fields['scores'] = json.dumps(update_fields['scores'])
            if 'evaluation_criteria_used' in update_fields and isinstance(update_fields['evaluation_criteria_used'], dict):
                update_fields['evaluation_criteria_used'] = json.dumps(update_fields['evaluation_criteria_used'])
            
            # Build dynamic SQL
            set_clauses = [f"{field} = %s" for field in update_fields.keys()]
            sql = f"""
                UPDATE evaluations 
                SET {', '.join(set_clauses)}, updated_at = CURRENT_TIMESTAMP 
                WHERE id = %s
            """
            
            # Prepare values (field values + evaluation_id)
            values = list(update_fields.values()) + [evaluation_id]
            
            cursor.execute(sql, values)
            conn.commit()
            
            if cursor.rowcount > 0:
                logger.info(f"Evaluation ID {evaluation_id} updated successfully. Fields: {list(update_fields.keys())}")
                updated = True
            else:
                logger.warning(f"Attempted to update evaluation ID {evaluation_id}, but evaluation not found or no change needed.")
                
        except Error as e:
            logger.error(f"Error updating evaluation ID {evaluation_id}: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
            
        return updated

    def delete_evaluation(self, evaluation_id: int) -> bool:
        """Delete an evaluation."""
        conn = self.connect()
        if not conn: return False
        cursor = conn.cursor()
        deleted = False
        try:
            sql = "DELETE FROM evaluations WHERE id = %s"
            cursor.execute(sql, (evaluation_id,))
            conn.commit()
            if cursor.rowcount > 0:
                logger.info(f"Evaluation ID {evaluation_id} deleted.")
                deleted = True
            else:
                logger.warning(f"No evaluation found with ID {evaluation_id} to delete.")
        except Error as e:
            logger.error(f"Error deleting evaluation {evaluation_id}: {e}")
            conn.rollback()
        finally:
            cursor.close()
            self.close()
        return deleted

    def get_evaluation_statistics(self) -> Dict[str, Any]:
        """Get evaluation statistics."""
        conn = self.connect()
        if not conn: return {}
        cursor = conn.cursor(dictionary=True)
        stats = {}
        try:
            # Total evaluations
            cursor.execute("SELECT COUNT(*) as total_evaluations FROM evaluations")
            stats['total_evaluations'] = cursor.fetchone()['total_evaluations']
            
            # Evaluations by status
            cursor.execute("""
                SELECT status, COUNT(*) as count 
                FROM evaluations 
                GROUP BY status
            """)
            stats['by_status'] = {row['status']: row['count'] for row in cursor.fetchall()}
            
            # Average overall score
            cursor.execute("""
                SELECT AVG(overall_score) as avg_score 
                FROM evaluations 
                WHERE overall_score IS NOT NULL
            """)
            result = cursor.fetchone()
            stats['average_score'] = float(result['avg_score']) if result['avg_score'] else 0.0
            
            # Evaluations by evaluator
            cursor.execute("""
                SELECT evaluator_username, COUNT(*) as count 
                FROM evaluations 
                GROUP BY evaluator_username 
                ORDER BY count DESC 
                LIMIT 10
            """)
            stats['top_evaluators'] = cursor.fetchall()
            
            # Recent evaluations count (last 7 days)
            cursor.execute("""
                SELECT COUNT(*) as recent_count 
                FROM evaluations 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            """)
            stats['recent_evaluations'] = cursor.fetchone()['recent_count']
            
            logger.debug("Retrieved evaluation statistics")
        except Error as e:
            logger.error(f"Error getting evaluation statistics: {e}")
        finally:
            cursor.close()
            self.close()
        return stats 