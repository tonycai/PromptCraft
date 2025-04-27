import os
import sqlite3
import tempfile
import pytest

import exam_init

def test_extract_sections_from_file(tmp_path):
    # Prepare a temporary markdown file
    md_file = tmp_path / "test.md"
    content = (
        "#### Heading1\n"
        "Line1\n"
        "Line2\n"
        "---\n"
        "#### Heading2\n"
        "LineA\n"
    )
    md_file.write_text(content)
    sections = exam_init.extract_sections_from_file(str(md_file))
    assert len(sections) == 2
    assert sections[0][0] == "Heading1"
    assert "Line1" in sections[0][1]
    assert sections[1][0] == "Heading2"

def test_initialize_and_populate_exam_db(tmp_path):
    # Create a temp prompts directory with one md file
    prompts_dir = tmp_path / "prompts"
    prompts_dir.mkdir()
    md = prompts_dir / "sample.md"
    md.write_text("#### S1\nSample content\n")
    # Database path
    db_path = tmp_path / "exam.db"
    # Initialize and populate
    exam_init.initialize_exam_db(str(db_path))
    exam_init.populate_exam_db(str(db_path), str(prompts_dir))
    # Verify entry
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute("SELECT guide_section, question_text FROM exam_questions")
    rows = cursor.fetchall()
    conn.close()
    assert len(rows) == 1
    guide_section, question_text = rows[0]
    assert "sample.md - S1" in guide_section
    assert "describe the purpose and usage" in question_text