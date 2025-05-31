#!/usr/bin/env python3
"""
Initialize the PromptCraft database (MySQL) and seed it with sample questions.
"""
import os
from promptcraft.database.db_handler import DatabaseHandler

# Helper to load environment variables if .env file exists, for local script execution
# In Docker, these would be set in the Docker environment.
def load_dotenv_if_present():
    try:
        from dotenv import load_dotenv
        # Assuming .env is in the project root, and this script is in the project root.
        # Adjust path if script is moved or .env is elsewhere.
        dotenv_path = os.path.join(os.path.dirname(__file__), '.env') # More robust path finding
        if os.path.exists(dotenv_path):
            load_dotenv(dotenv_path)
            print(".env file loaded for local execution.")
        elif os.path.exists('.env'): # Fallback for current dir if script is at root
            load_dotenv()
            print(".env file loaded from current directory for local execution.")
    except ImportError:
        print("python-dotenv not installed, .env file will not be loaded by this script.")
    except Exception as e:
        print(f"Error loading .env file: {e}")

def main():
    """Initialize the database tables and add sample questions."""
    load_dotenv_if_present() # Load .env for local runs
    
    db_handler = DatabaseHandler() # Now connects using env vars
    
    # Ensure database exists and initialize tables
    # ensure_database_exists is called in db_handler.__init__ if uncommented, 
    # or called explicitly by initialize_tables method now.
    print("Initializing tables...")
    db_handler.initialize_tables() 
    
    # Sample questions to add
    sample_questions = [
        {
            "description": "Write a Python function that calculates the factorial of a number.",
            "expected_outcome": "A Python function that correctly calculates factorial, handling edge cases.",
            "evaluation_criteria": [
                "Prompt clearly specifies a Python function",
                "Asks for factorial calculation",
                "Specifies parameter and return types",
                "Mentions handling edge cases (negative numbers, zero)"
            ],
            "programming_language": "Python",
            "difficulty_level": "Easy"
        },
        {
            "description": "Create a JavaScript function to sort an array of objects by a specific property.",
            "expected_outcome": "A JavaScript function that sorts an array of objects by a named property.",
            "evaluation_criteria": [
                "Prompt clearly specifies JavaScript",
                "Defines the sorting requirement clearly",
                "Specifies input/output formats",
                "Mentions handling edge cases (empty arrays, missing properties)"
            ],
            "programming_language": "JavaScript",
            "difficulty_level": "Medium"
        },
        {
            "description": "Write a SQL query to find the top 5 customers who spent the most money.",
            "expected_outcome": "A SQL query that correctly identifies the top 5 customers by total purchase amount.",
            "evaluation_criteria": [
                "Prompt identifies that SQL is needed",
                "Clearly defines the data model or asks for clarification",
                "Specifies the ranking criterion (spent the most money)",
                "Limits results to top 5"
            ],
            "programming_language": "SQL",
            "difficulty_level": "Medium"
        }
    ]
    
    # Add each sample question to the database
    print("Adding sample questions to 'questions' table...")
    for question_data in sample_questions: # Renamed to avoid conflict with 'questions' table name
        db_handler.add_question(
            description=question_data["description"],
            expected_outcome=question_data["expected_outcome"],
            evaluation_criteria=question_data["evaluation_criteria"],
            programming_language=question_data["programming_language"],
            difficulty_level=question_data["difficulty_level"]
        )
    
    print("Database initialization complete. Sample questions have been added.")

if __name__ == "__main__":
    main() 