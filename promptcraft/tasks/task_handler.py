"""
Task handler for PromptCraft.
"""
import os
import json
from datetime import datetime
import time


class TaskHandler:
    """Handles presenting tasks and recording submissions."""
    
    def __init__(self, output_dir="candidate_submissions"):
        """Initialize the task handler with the output directory."""
        self.output_dir = output_dir
        # Create output directory if it doesn't exist
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
        # Ensure directory exists and is writable
        os.makedirs(output_dir, exist_ok=True)
            
    def present_task(self, task_id, task_description):
        """Present a task to the candidate."""
        print(f"\n--- Task {task_id} ---")
        print(task_description)
        print("\nPlease provide the prompt you would use to instruct an LLM to generate the code:")
        prompt = input("> ")
        return prompt
        
    def record_submission(self, candidate_id, task_id, prompt, generated_code=None):
        """Record the candidate's prompt and the generated code."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.output_dir}/{candidate_id}_task{task_id}_{timestamp}.txt"
        
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
        return filename 