#!/usr/bin/env python3
"""
Initialize exam questions in the MySQL database (promptcraft_db.exam_questions table)
with questions extracted from the prompts directory.
This script parses each Markdown file in ./prompts/, extracts prompt sections,
and inserts them as exam questions.
"""
import os
from promptcraft.database.db_handler import DatabaseHandler # Use the MySQL capable handler

PROMPTS_DIR = "prompts"

# Helper to load environment variables (same as in initialize_database.py)
def load_dotenv_if_present():
    try:
        from dotenv import load_dotenv
        dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
        if os.path.exists(dotenv_path):
            load_dotenv(dotenv_path)
            print(".env file loaded for local execution of exam_init.")
        elif os.path.exists('.env'):
            load_dotenv()
            print(".env file loaded from current directory for local execution of exam_init.")
    except ImportError:
        print("python-dotenv not installed, .env file will not be loaded by this script for exam_init.")
    except Exception as e:
        print(f"Error loading .env file for exam_init: {e}")

def extract_sections_from_file(file_path):
    """Extract headings and content sections from a Markdown file."""
    sections = []
    with open(file_path, encoding='utf-8') as f:
        lines = f.readlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith('####'):
            # Capture heading title
            heading = line.strip().lstrip('#').strip()
            # Capture content until next heading or separator
            content_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('####') and not lines[i].strip().startswith('---'):
                content_lines.append(lines[i])
                i += 1
            content = ''.join(content_lines).strip()
            sections.append((heading, content))
        else:
            i += 1
    return sections

def populate_exam_db_mysql(db_handler: DatabaseHandler, prompts_dir_path: str):
    """Read all Markdown files in prompts_dir_path and insert sections into the exam_questions table via db_handler."""
    total_inserted = 0
    if not os.path.isdir(prompts_dir_path):
        print(f"Error: Prompts directory '{prompts_dir_path}\' not found at {os.path.abspath(prompts_dir_path)}.")
        return

    for fname in os.listdir(prompts_dir_path):
        if not fname.lower().endswith('.md'):
            continue
        path = os.path.join(prompts_dir_path, fname)
        sections = extract_sections_from_file(path)
        for heading, content in sections:
            question_text = (
                f"From the guide '{fname}', section '{heading}', describe the purpose and usage of the following AI prompt template:\\n\\n{content}"
            )
            # Use the db_handler to add the exam question
            question_id = db_handler.add_exam_question(
                guide_section=f"{fname} - {heading}",
                question_text=question_text
            )
            if question_id:
                total_inserted += 1
            else:
                print(f"Failed to insert exam question from {fname} - {heading}")
    print(f"Inserted {total_inserted} exam questions into the database.")

def main():
    load_dotenv_if_present() # Load .env for local runs

    db_handler = DatabaseHandler() # Uses env vars for connection

    # Ensure prompts directory exists
    if not os.path.isdir(PROMPTS_DIR):
        print(f"Error: prompts directory '{PROMPTS_DIR}\' not found at {os.path.abspath(PROMPTS_DIR)}.")
        return

    # 1. Ensure database and tables exist (includes exam_questions table)
    print("Initializing tables (including exam_questions)...")
    db_handler.initialize_tables()

    # 2. Clear existing exam questions from the table for a fresh start
    print("Clearing existing exam questions...")
    db_handler.clear_exam_questions()

    # 3. Populate the exam_questions table
    print(f"Populating exam questions from '{PROMPTS_DIR}\' directory...")
    populate_exam_db_mysql(db_handler, PROMPTS_DIR)
    
    print("Exam questions processing complete.")

if __name__ == '__main__':
    main()