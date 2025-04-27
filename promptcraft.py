#!/usr/bin/env python3
"""
PromptCraft - A framework for assessing and evaluating prompting proficiency in technical interviews.
"""

import os
import argparse
from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.tasks.task_handler import TaskHandler
from promptcraft.evaluation.evaluator import Evaluator


def simulate_llm_response(prompt):
    """
    Simulate getting a response from an LLM.
    In a real implementation, this would connect to an actual LLM API.
    
    Args:
        prompt: The prompt to send to the LLM
        
    Returns:
        A string representing the simulated generated code
    """
    # For demonstration, return simple canned responses based on keywords
    if "factorial" in prompt.lower():
        return """```python
def factorial(n):
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)
```"""
    elif "sort" in prompt.lower() and "array" in prompt.lower():
        return """```javascript
function sortByProperty(array, property) {
  if (!Array.isArray(array) || array.length === 0) {
    return [];
  }
  
  return array.sort((a, b) => {
    if (!a.hasOwnProperty(property) || !b.hasOwnProperty(property)) {
      return 0;
    }
    
    if (a[property] < b[property]) {
      return -1;
    }
    if (a[property] > b[property]) {
      return 1;
    }
    return 0;
  });
}
```"""
    elif "sql" in prompt.lower() and "top 5" in prompt.lower():
        return """```sql
SELECT 
  customers.customer_id,
  customers.name,
  SUM(orders.total_amount) AS total_spent
FROM 
  customers
JOIN 
  orders ON customers.customer_id = orders.customer_id
GROUP BY 
  customers.customer_id, customers.name
ORDER BY 
  total_spent DESC
LIMIT 5;
```"""
    else:
        return """```
-- This is a simulated response from an LLM
-- In a real implementation, this would be actual generated code based on the prompt
```"""


def run_assessment(candidate_id):
    """
    Run a complete assessment for a candidate.
    
    Args:
        candidate_id: Identifier for the candidate
    """
    db_handler = DatabaseHandler()
    task_handler = TaskHandler()
    evaluator = Evaluator()
    
    # Get all available questions
    questions = db_handler.get_all_questions()
    if not questions:
        print("No questions found in the database. Please run initialize_database.py first.")
        return
    
    print(f"\n=== PromptCraft Assessment for Candidate {candidate_id} ===\n")
    print(f"There are {len(questions)} tasks available for assessment.")
    
    for question in questions:
        task_id = question["id"]
        description = question["description"]
        
        # Present the task and get the candidate's prompt
        prompt = task_handler.present_task(task_id, description)
        
        # Get the simulated LLM response (or connect to a real LLM)
        generated_code = simulate_llm_response(prompt)
        
        # Record the submission
        task_handler.record_submission(candidate_id, task_id, prompt, generated_code)
        
        # Get detailed question info for evaluation
        question_details = db_handler.get_question_details(task_id)
        evaluation_criteria = question_details.get("evaluation_criteria") if question_details else None
        
        # Evaluate the submission
        evaluator.evaluate_submission(
            candidate_id, 
            task_id, 
            prompt, 
            generated_code, 
            evaluation_criteria
        )
    
    print("\n=== Assessment Complete ===")
    print(f"All tasks have been assessed for Candidate {candidate_id}.")
    print("Submissions and evaluations have been saved to their respective directories.")


def main():
    """Main function to run the PromptCraft assessment."""
    parser = argparse.ArgumentParser(description="PromptCraft - A framework for assessing prompting proficiency")
    parser.add_argument("--candidate", "-c", type=str, required=True, help="Candidate ID for the assessment")
    args = parser.parse_args()
    
    # Run the assessment with the provided candidate ID
    run_assessment(args.candidate)


if __name__ == "__main__":
    main() 