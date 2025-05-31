#!/usr/bin/env python3
"""
PromptCraft CLI - A framework for assessing prompting proficiency.
"""
import os
import argparse
from openai import OpenAI
from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.tasks.task_handler import TaskHandler
from promptcraft.evaluation.evaluator import Evaluator

# Load API key from environment variable
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
client = None
if OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)
else:
    print("Warning: OPENAI_API_KEY environment variable not set. LLM calls will be simulated.")


def get_llm_response(prompt):
    """Gets a response from the OpenAI API or simulates if key is missing."""
    if not client:
        print("(Simulating LLM response as API key is missing...)")
        return simulate_llm_response(prompt) # Fallback to simulation
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
        print("Falling back to simulated response.")
        return simulate_llm_response(prompt) # Fallback to simulation on error

def simulate_llm_response(prompt):
    """
    Simulate getting a response from an LLM.
    """
    lower = prompt.lower()
    if "factorial" in lower:
        return """```python
def factorial(n):
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    if n in (0, 1):
        return 1
    return n * factorial(n - 1)
```"""
    if "sort" in lower and "array" in lower:
        return """```javascript
function sortByProperty(array, property) {
  return array.sort((a, b) => (a[property] > b[property] ? 1 : -1));
}
```"""
    if "sql" in lower and "top 5" in lower:
        return """```sql
SELECT customer_id, SUM(amount) AS total_spent
FROM purchases
GROUP BY customer_id
ORDER BY total_spent DESC
LIMIT 5;
```"""
    return """```
-- Simulated LLM response
```"""


def run_assessment(candidate_id):
    db_handler = DatabaseHandler()
    task_handler = TaskHandler()
    evaluator = Evaluator()

    questions = db_handler.get_all_questions()
    if not questions:
        print("No questions in DB. Run initialize_database.py first.")
        return

    print(f"\n=== Assessment for Candidate {candidate_id} ===")
    for q in questions:
        task_id, desc = q['id'], q['description']
        print(f"\n--- Task {task_id} ---\n{desc}")
        prompt = task_handler.present_task(task_id, desc)
        code = get_llm_response(prompt)
        task_handler.record_submission(candidate_id, task_id, prompt, code)
        details = db_handler.get_question_details(task_id)
        criteria = details.get('evaluation_criteria') if details else None
        evaluator.evaluate_submission(candidate_id, task_id, prompt, code, criteria)

    print("\n=== Assessment Complete ===")


def main():
    parser = argparse.ArgumentParser(description="PromptCraft CLI")
    parser.add_argument("--candidate", "-c", type=str,
                        help="Candidate ID (or set CANDIDATE_ID env var)")
    args = parser.parse_args()
    cid = args.candidate or os.getenv('CANDIDATE_ID')
    if not cid:
        parser.error("Provide --candidate or set CANDIDATE_ID.")
    
    # Check for API key before running assessment if we intend to use real LLM
    if not OPENAI_API_KEY:
        print("Consider setting the OPENAI_API_KEY environment variable for real LLM interaction.")
        # Depending on policy, you might choose to exit here or always allow simulation
        # For now, it proceeds with simulation as per get_llm_response logic

    run_assessment(cid)


if __name__ == '__main__':
    main()