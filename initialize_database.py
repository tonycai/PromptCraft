#!/usr/bin/env python3
"""
Initialize the PromptCraft database and seed it with sample questions.
"""

from promptcraft.database.db_handler import DatabaseHandler


def main():
    """Initialize the database and add sample questions."""
    db_handler = DatabaseHandler()
    db_handler.initialize_database()
    
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
    for question in sample_questions:
        db_handler.add_question(
            description=question["description"],
            expected_outcome=question["expected_outcome"],
            evaluation_criteria=question["evaluation_criteria"],
            programming_language=question["programming_language"],
            difficulty_level=question["difficulty_level"]
        )
    
    print("Database initialization complete. Sample questions have been added.")


if __name__ == "__main__":
    main() 