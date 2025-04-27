import sqlite3
import json
import pytest
from promptcraft.database.db_handler import DatabaseHandler


@pytest.fixture
def temp_db(tmp_path):
    db_path = tmp_path / "test.db"
    return str(db_path)

def test_initialize_database_creates_table(temp_db):
    dbh = DatabaseHandler(db_file=temp_db)
    dbh.initialize_database()
    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='questions'"
    )
    assert cursor.fetchone() is not None
    conn.close()

def test_add_and_get_question(temp_db):
    dbh = DatabaseHandler(db_file=temp_db)
    dbh.initialize_database()
    description = "desc"
    expected = "outcome"
    criteria = ["a", "b"]
    lang = "Python"
    diff = "Easy"
    qid = dbh.add_question(
        description, expected, criteria, lang, diff
    )
    assert isinstance(qid, int)
    all_q = dbh.get_all_questions()
    assert any(q['id'] == qid and q['description'] == description for q in all_q)
    details = dbh.get_question_details(qid)
    assert details['description'] == description
    assert details['expected_outcome'] == expected
    assert details['evaluation_criteria'] == criteria
    assert details['programming_language'] == lang
    assert details['difficulty_level'] == diff