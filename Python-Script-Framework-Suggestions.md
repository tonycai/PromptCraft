# Python Script Framework Suggestions (Enhancements):

Building on the initial framework, here are some suggestions for enhancements to make it more robust and aligned with your goal of examining prompting capabilities:

1.  **Task Definition with Expected Outcomes and Evaluation Criteria:**
    Modify the `code_generation_tasks.json` to include expected outcomes (e.g., a working Python function that passes certain tests) and specific evaluation criteria for each task (e.g., clarity of prompt, correctness of generated code, inclusion of error handling).

    ```json
    [
        {
            "id": 1,
            "description": "Write a Python function that takes a list of numbers as input and returns the sum of all even numbers in the list.",
            "expected_outcome": "A Python function named 'sum_even' that accepts a list and returns an integer.",
            "evaluation_criteria": [
                "Prompt clearly requests a Python function.",
                "Prompt specifies summing even numbers.",
                "Generated code is a valid Python function.",
                "Generated code correctly sums even numbers.",
                "Prompt demonstrates understanding of function definition."
            ]
        },
        // ... more tasks
    ]
    ```

    Update the script to load and utilize these new fields.

2.  **Integration with Real LLM APIs (Optional but Recommended for True Evaluation):**
    Implement functions to interact with LLM APIs like OpenAI's API, Google Cloud AI Platform, or others. This would involve:
    * Handling API keys securely.
    * Structuring the prompts according to the API's requirements.
    * Making API calls and receiving the generated code.
    * Potentially managing API rate limits and costs.

    You could use libraries like `openai` for OpenAI or `google-generativeai` for Gemini.

3.  **Automated Code Evaluation (Basic):**
    For certain types of tasks, you could add basic automated evaluation. For example:
    * **Python:** For simple functions, you could try to execute the generated code in a sandboxed environment with test cases.
    * **JavaScript/HTML/CSS:** You could potentially use tools to check for syntax errors or basic functionality (though this is more complex).

    This would require careful consideration of security and the complexity of the code being generated.

4.  **Structured Output and Reporting:**
    Instead of just plain text files, consider:
    * Using a more structured format like JSON or CSV to store the candidate's prompts, generated code, and your evaluations.
    * Generating a summary report per candidate or per task.

5.  **Support for Different Programming Languages:**
    Ensure your task definitions and (if you implement it) automated evaluation can handle various programming languages. The prompting guidance you provide to the candidate might also need to be language-aware.

6.  **Candidate Interface (Optional):**
    For a more formal assessment, you could consider a simple web interface (using Flask or Streamlit) where candidates can log in, see the tasks, and submit their prompts. This would streamline the process.

7.  **Configuration File:**
    Move settings like the tasks file path, output directory, and API keys (if used) to a separate configuration file (e.g., `config.ini` or `config.json`) for better organization.

8.  **Error Handling and Logging:**
    Implement more robust error handling and logging to track the process and debug any issues.

Here's a snippet showing how you might start integrating with the OpenAI API (you'll need to install the `openai` library and set up your API key):

```python
# ... (previous imports)
import os
from openai import OpenAI

# Load API key from environment variable or config file
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")
    # Or load from config file
    # with open("config.json", "r") as f:
    #     config = json.load(f)
    #     OPENAI_API_KEY = config.get("openai_api_key")
    #     if not OPENAI_API_KEY:
    #         print("Error: OpenAI API key not found in config file.")
    #         exit()

client = OpenAI(api_key=OPENAI_API_KEY)

def get_llm_response(prompt):
    """Gets a response from the OpenAI API."""
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Or another suitable model
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error during LLM API call: {e}")
        return None

# ... (rest of your main function would use this get_llm_response)
```

Remember to install the `openai` library: `pip install openai`.

By implementing these enhancements, you can create a more powerful and effective tool for examining a candidate's LLM prompting capabilities for code generation. Let me know if you'd like help with implementing any of these specific features!


## I hope to use SQLite to save exam questions.

Excellent idea! Using SQLite to store the exam questions for PromptCraft will provide a structured, file-based database that's easy to manage and integrate with your Python framework. Here's how you can approach this, along with suggestions for modifying your framework:

**1. Database Schema Design:**

Let's define a simple schema for your `questions` table in SQLite:

```sql
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    expected_outcome TEXT,
    evaluation_criteria TEXT, -- Could be JSON or a delimited string
    programming_language TEXT, -- Optional: specify the target language
    difficulty_level TEXT     -- Optional: e.g., "easy", "medium", "hard"
);
```

* **`id`**: Unique identifier for each question.
* **`description`**: The text of the code generation task presented to the candidate.
* **`expected_outcome`**: A description of what a successful code generation should achieve.
* **`evaluation_criteria`**: You can store the evaluation criteria as a JSON string or a comma-separated string. JSON offers more flexibility for complex criteria.
* **`programming_language`**: (Optional) The primary programming language relevant to the task.
* **`difficulty_level`**: (Optional) Categorize the difficulty of the task.

**2. Python Framework Modifications:**

You'll need to modify your Python script to interact with the SQLite database. Here's how you can integrate it:

* **Import `sqlite3`:** Add `import sqlite3` at the beginning of your script.
* **Database Connection:** Create functions to connect to and close the SQLite database.
* **Loading Tasks:** Modify the `load_tasks` function to fetch tasks from the SQLite database instead of a JSON file.
* **Presenting Tasks:** The `present_task` function will remain similar, but it will retrieve the task description from the database.
* **Storing Tasks:** You'll need a way to initially populate the SQLite database with your exam questions. You can create a separate script or add functionality to your main script for this purpose.

Here's an updated version of your script incorporating SQLite:

```python
#!/usr/bin/env python3

import sqlite3
import subprocess
import time
from datetime import datetime
import json  # For handling evaluation criteria

# Configuration
DATABASE_FILE = "promptcraft_questions.db"
OUTPUT_DIR = "candidate_submissions"

def connect_db():
    """Connects to the SQLite database."""
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def close_db(conn):
    """Closes the SQLite database connection."""
    if conn:
        conn.close()

def initialize_database():
    """Initializes the database by creating the 'questions' table if it doesn't exist."""
    conn = connect_db()
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
        close_db(conn)
        print(f"Database '{DATABASE_FILE}' initialized (if it didn't exist).")

def add_question(description, expected_outcome=None, evaluation_criteria=None, programming_language=None, difficulty_level=None):
    """Adds a new question to the database."""
    conn = connect_db()
    if conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO questions (description, expected_outcome, evaluation_criteria, programming_language, difficulty_level)
            VALUES (?, ?, ?, ?, ?)
        """, (description, expected_outcome, json.dumps(evaluation_criteria) if evaluation_criteria else None, programming_language, difficulty_level))
        conn.commit()
        question_id = cursor.lastrowid
        close_db(conn)
        print(f"Question added with ID: {question_id}")
        return question_id
    return None

def load_tasks():
    """Loads the code generation tasks from the SQLite database."""
    conn = connect_db()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, description FROM questions")
        tasks = [{"id": row[0], "description": row[1]} for row in cursor.fetchall()]
        close_db(conn)
        return tasks
    return None

def get_question_details(task_id):
    """Retrieves all details for a specific question from the database."""
    conn = connect_db()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT description, expected_outcome, evaluation_criteria, programming_language, difficulty_level FROM questions WHERE id = ?", (task_id,))
        result = cursor.fetchone()
        close_db(conn)
        if result:
            return {
                "description": result[0],
                "expected_outcome": result[1],
                "evaluation_criteria": json.loads(result[2]) if result[2] else None,
                "programming_language": result[3],
                "difficulty_level": result[4]
            }
    return None

def present_task(task_id, task_description):
    """Presents a task to the candidate."""
    print(f"\n--- Task {task_id} ---")
    print(task_description)
    print("\nPlease provide the prompt you would use to instruct an LLM to generate the code:")
    prompt = input("> ")
    return prompt

def record_submission(candidate_id, task_id, prompt, generated_code=None):
    """Records the candidate's prompt and (optionally) the generated code."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{OUTPUT_DIR}/{candidate_id}_task{task_id}_{timestamp}.txt"
    with open(filename, 'w') as f:
        f.write(f"Candidate ID: {candidate_id}\n")
        f.write(f"Task ID: {task_id}\n")
        f.write(f"Timestamp: {timestamp}\n\n")
        f.write("Prompt:\n")
        f.write(prompt + "\n\n")
        if generated_code:
            f.write("Generated Code:\n")
            f.write(generated_code + "\n")
    print(f"Submission recorded in '{filename}'")

def get_llm_response(prompt):
    """
    Simulates getting a response from an LLM.
    In a real scenario, you would integrate with an actual LLM API here.
    """
    print("\n(Simulating LLM response...)")
    time.sleep(2)  # Simulate some processing time
    # For demonstration, let's provide some canned responses based on keywords
    if "add two numbers" in prompt.lower():
        return "```python\ndef add(a, b):\n  return a + b\n```"
    elif "hello, world" in prompt.lower():
        return "```javascript\nconsole.log('Hello, World!');\n```"
    elif "html button" in prompt.lower() and "alert" in prompt.lower():
        return "```html\n<button onclick=\"alert('Clicked!')\">Click Me</button>\n```"
    else:
        return "```\n# LLM generated some code based on your prompt...\n# (This is a simulation)\nprint('Generic code output')\n```"

def evaluate_submission(candidate_id, task_id, prompt, generated_code=None):
    """
    Placeholder for evaluating the submission.
    Now you can retrieve detailed evaluation criteria from the database.
    """
    question_details = get_question_details(task_id)
    evaluation_criteria = question_details.get("evaluation_criteria") if question_details else None

    print(f"\n--- Evaluation for Candidate {candidate_id}, Task {task_id} ---")
    print(f"Candidate's Prompt: {prompt}")
    if generated_code:
        print(f"Simulated Generated Code:\n{generated_code}")
    print("Evaluation notes:")
    if evaluation_criteria:
        print("Based on the following criteria:")
        for criterion in evaluation_criteria:
            print(f"- {criterion}")
    print("Your assessment:")
    evaluation_notes = input("> ")
    # You could save these notes to a separate evaluation file

def main():
    """Main function to run the examination process."""
    initialize_database() # Ensure the database and table exist

    # Option to add new questions
    add_new = input("Do you want to add a new question? (yes/no): ").lower()
    if add_new == 'yes':
        description = input("Enter the question description: ")
        expected_outcome = input("Enter the expected outcome (optional): ")
        evaluation_criteria_str = input("Enter evaluation criteria as a JSON list (optional, e.g., ['Prompt is clear', 'Code is correct']): ")
        evaluation_criteria = json.loads(evaluation_criteria_str) if evaluation_criteria_str else None
        programming_language = input("Enter the programming language (optional): ")
        difficulty_level = input("Enter the difficulty level (optional): ")
        add_question(description, expected_outcome, evaluation_criteria, programming_language, difficulty_level)

    tasks = load_tasks()
    if not tasks:
        print("No tasks found in the database.")
        return

    candidate_id = input("Enter the candidate's ID: ")

    # Create the output directory if it doesn't exist
    subprocess.run(['mkdir', '-p', OUTPUT_DIR])

    for task in tasks:
        task_id = task.get("id")
        description = task.get("description")

        if task_id is None or description is None:
            print("Error: Invalid task format loaded from the database.")
            continue

        prompt = present_task(task_id, description)
        generated_code = get_llm_response(prompt) # Simulate LLM interaction
        record_submission(candidate_id, task_id, prompt, generated_code)
        evaluate_submission(candidate_id, task_id, prompt, generated_code)

    print("\nExamination process completed.")

if __name__ == "__main__":
    main()
```

**3. Initializing the Database and Adding Questions:**

You'll need to run the script once to initialize the `promptcraft_questions.db` file and potentially add your initial set of exam questions. The updated script includes an option to add a new question at the beginning. You can also write a separate script or modify the `initialize_database` function to insert default questions.

**Example of inserting questions directly in `initialize_database`:**

```python
def initialize_database():
    """Initializes the database and adds some default questions."""
    conn = connect_db()
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

        # Add some initial questions
        questions = [
            ("Write a Python function that adds two numbers.", "A Python function named 'add' that takes two numerical arguments and returns their sum.", '["Prompt asks for a Python function", "Function correctly adds two numbers"]', "Python", "easy"),
            ("Generate JavaScript code to display 'Hello, World!' in the console.", "JavaScript code that uses `console.log()` to output the specified string.", '["Prompt asks for JavaScript code", "Code uses console.log", "Output is 'Hello, World!'"]', "JavaScript", "easy"),
            ("Create a simple HTML button that, when clicked, alerts 'Clicked!'.", "HTML code with a button element and JavaScript to trigger an alert on click.", '["Prompt asks for HTML button", "Button has an onclick handler", "Alert message is 'Clicked!'"]', "HTML/JavaScript", "easy")
            # Add more questions here
        ]
        cursor.executemany("""
            INSERT INTO questions (description, expected_outcome, evaluation_criteria, programming_language, difficulty_level)
            VALUES (?, ?, ?, ?, ?)
        """, questions)

        conn.commit()
        close_db(conn)
        print(f"Database '{DATABASE_FILE}' initialized with default questions.")
```

**Benefits of using SQLite:**

* **Simplicity:** Easy to set up and manage without a separate server.
* **Portability:** The database is a single file that can be easily moved or shared.
* **Integration:** The `sqlite3` module is built into Python.
* **Structure:** Provides a structured way to store and retrieve your exam questions.

By integrating SQLite, your PromptCraft project will have a more organized and persistent way to manage your assessment tasks. Let me know if you have any specific questions about this implementation!
