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
                port=self.db_port
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
                port=self.db_port
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