"""
Database handler for PromptCraft.
"""
import sqlite3
import json
import os
from pathlib import Path


class DatabaseHandler:
    """Handles all database operations for PromptCraft."""
    
    def __init__(self, db_file="promptcraft_questions.db"):
        """Initialize the database handler with the path to the database file."""
        self.db_file = db_file
        self.conn = None
        
    def connect(self):
        """Connect to the SQLite database."""
        try:
            self.conn = sqlite3.connect(self.db_file)
            return self.conn
        except sqlite3.Error as e:
            print(f"Error connecting to database: {e}")
            return None
    
    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            
    def initialize_database(self):
        """Initialize the database tables if they don't exist."""
        conn = self.connect()
        if conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS questions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    description TEXT NOT NULL,
                    expected_outcome TEXT,
                    evaluation_criteria TEXT,
                    programming_language TEXT,
                    difficulty_level TEXT
                )
            """)
            conn.commit()
            self.close()
            print(f"Database '{self.db_file}' initialized.")
            
    def add_question(self, description, expected_outcome=None, evaluation_criteria=None, 
                    programming_language=None, difficulty_level=None):
        """Add a new question to the database."""
        conn = self.connect()
        if conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO questions (description, expected_outcome, evaluation_criteria, 
                                      programming_language, difficulty_level)
                VALUES (?, ?, ?, ?, ?)
            """, (description, expected_outcome, 
                 json.dumps(evaluation_criteria) if evaluation_criteria else None, 
                 programming_language, difficulty_level))
            conn.commit()
            question_id = cursor.lastrowid
            self.close()
            print(f"Question added with ID: {question_id}")
            return question_id
        return None
        
    def get_all_questions(self):
        """Retrieve all questions from the database."""
        conn = self.connect()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, description FROM questions")
            questions = [{"id": row[0], "description": row[1]} for row in cursor.fetchall()]
            self.close()
            return questions
        return []
        
    def get_question_details(self, question_id):
        """Retrieve detailed information about a specific question."""
        conn = self.connect()
        if conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT description, expected_outcome, evaluation_criteria, 
                       programming_language, difficulty_level 
                FROM questions 
                WHERE id = ?
            """, (question_id,))
            result = cursor.fetchone()
            self.close()
            if result:
                return {
                    "description": result[0],
                    "expected_outcome": result[1],
                    "evaluation_criteria": json.loads(result[2]) if result[2] else None,
                    "programming_language": result[3],
                    "difficulty_level": result[4]
                }
        return None 