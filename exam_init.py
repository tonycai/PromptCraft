#!/usr/bin/env python3
"""
Initialize an exam SQLite database with questions extracted from the prompts directory.
This script parses each Markdown file in ./prompts/, extracts prompt sections,
and inserts them as exam questions into exam_questions.db.
"""
import os
import sqlite3

DB_FILE = "exam_questions.db"
PROMPTS_DIR = "prompts"

def initialize_exam_db(db_path):
    """Create the exam_questions table in the database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS exam_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guide_section TEXT,
            question_text TEXT NOT NULL,
            answer_text TEXT,
            question_type TEXT DEFAULT 'short-answer'
        )
        """
    )
    conn.commit()
    conn.close()

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

def populate_exam_db(db_path, prompts_dir):
    """Read all Markdown files in prompts_dir and insert sections into the exam DB."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    total = 0
    for fname in os.listdir(prompts_dir):
        if not fname.lower().endswith('.md'):
            continue
        path = os.path.join(prompts_dir, fname)
        sections = extract_sections_from_file(path)
        for heading, content in sections:
            question_text = (
                f"From the guide '{fname}', section '{heading}', describe the purpose and usage of the following AI prompt template:\n\n{content}"
            )
            cursor.execute(
                "INSERT INTO exam_questions (guide_section, question_text) VALUES (?, ?)",
                (f"{fname} - {heading}", question_text)
            )
            total += 1
    conn.commit()
    conn.close()
    print(f"Inserted {total} exam questions into '{db_path}'.")

def main():
    # Ensure prompts directory exists
    if not os.path.isdir(PROMPTS_DIR):
        print(f"Error: prompts directory '{PROMPTS_DIR}' not found.")
        return
    # Remove existing DB file to reinitialize
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    initialize_exam_db(DB_FILE)
    populate_exam_db(DB_FILE, PROMPTS_DIR)
    print("Exam database initialization complete.")

if __name__ == '__main__':
    main()