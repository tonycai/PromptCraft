# PromptCraft

A framework for assessing and evaluating "prompting proficiency" in technical interviews - the ability to effectively instruct AI language models for code generation.

## Overview

PromptCraft is designed for technical interviewers and hiring managers who want to evaluate a candidate's ability to leverage AI tools effectively. In an era where Large Language Models (LLMs) can generate code, the bottleneck is shifting towards the human's capacity to articulate clear, specific, and intelligent instructions. PromptCraft provides a structured approach to assess this critical skill.

## Project Vision

We envision PromptCraft as a versatile and extensible tool that enables technical interviewers to:

- Design targeted code generation tasks that probe different aspects of prompting ability
- Objectively evaluate a candidate's prompts based on clarity, specificity, and technical understanding
- Gain insights into a candidate's problem-solving approach when interacting with AI
- Identify candidates who can effectively collaborate with AI to enhance productivity and code quality

## Core Components

The PromptCraft workflow consists of the following components:

1. **靈感 (Inspiration)** - Gathering ideas for effective assessment tasks
2. **對談需求 (Dialogue Requirements)** - Defining the prompt-based interaction parameters
3. **用戶故事 (User Stories)** - Identifying key personas and their needs
4. **驗收標準 (Acceptance Criteria)** - Establishing clear evaluation metrics
5. **編寫程式 (Program Development)** - Implementing the assessment framework
6. **測試程式 (Program Testing)** - Validating the functionality and effectiveness

## Implementation

PromptCraft is implemented as a Python framework and is transitioning towards a web-based application. Key features include:

- SQLite databases for storing code generation tasks, exam questions, and evaluation criteria.
- **FastAPI Backend**: Provides a RESTful API for managing assessments, questions, submissions, and evaluations.
- **Next.js Frontend (Planned)**: A modern web interface for candidates and interviewers.
- Original CLI Interface (`promptcraft.cli`): For running assessments directly from the command line (still functional).
- Integration options with real LLM APIs (e.g., OpenAI, Google Cloud), with current support for OpenAI via API key.
- Structured output and reporting for easy assessment (candidate submissions in `candidate_submissions/`, evaluations in `evaluation_results/`).
- Support for various programming languages and difficulty levels for tasks.

## User Stories

The following personas and goals guide PromptCraft's design:
- **New Developer / Learner**: Build foundational understanding via AI-driven explanations.
- **Feature Developer**: Quickly scaffold and enhance new features with robust prompt templates.
- **Code Maintainer / Refactorer**: Refactor and modularize code using targeted AI prompts.
- **Troubleshooter**: Systematically debug and resolve issues with AI-assisted logs.
- **Continuous Learner**: Deep-dive into technologies and best practices.
- **Contributor / Collaborator**: Use clear templates to propose and review changes.
- **Project Owner / Maintainer**: Provide structured prompt guides and metrics.

## General Architecture

PromptCraft's architecture includes:

- **FastAPI Backend (`api/`)**:
  - Serves RESTful API endpoints for all application functionalities.
  - Uses Pydantic for data validation.
  - Organised into routers for questions, submissions, and evaluations.
- **Core Logic (`promptcraft/`)**:
  - `DatabaseHandler`: Manages interactions with SQLite databases.
  - `TaskHandler`: Handles task presentation logic and submission recording.
  - `Evaluator`: Manages evaluation recording.
  - `cli.py`: The command-line interface for assessments.
- **Next.js Frontend (`frontend/`) (Planned)**:
  - Will consume the FastAPI backend to provide a user-friendly web interface.
- **SQLite Databases**:
  - `promptcraft_questions.db`: For assessment tasks (used by both CLI and API).
  - `exam_questions.db`: For exam questions extracted from Markdown prompts in `./prompts/`.
- **Initialization Scripts**:
  - `initialize_database.py`: Seeds initial coding tasks into `promptcraft_questions.db`.
  - `exam_init.py`: Extracts exam questions from `./prompts/` into `exam_questions.db`.
- **Dockerfile**:
  - For containerized deployment (to be updated for API and frontend).
- **Output Directories**:
  - `candidate_submissions/`: Stores candidate's prompts and LLM generated code.
  - `evaluation_results/`: Stores evaluation data in JSON format.

## Workflow

The primary workflow is moving towards a web-based interaction via the planned Next.js frontend and the FastAPI backend. The traditional CLI workflow is also available.

**1. Setup & Initialization (Common for all workflows):**
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Initialize the task database:
     ```bash
     python initialize_database.py
     ```
   - (Optional) Generate exam questions:
     ```bash
     python exam_init.py
     ```

**2. API-driven Workflow (New):**
   - Start the FastAPI backend:
     ```bash
     uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
     ```
     (Ensure `OPENAI_API_KEY` environment variable is set for real LLM interaction, otherwise it will use simulations.)
   - Interact with the API endpoints (e.g., using a tool like Postman/Insomnia, or the planned Next.js frontend):
     - `GET /api/v1/questions` to list tasks.
     - `POST /api/v1/submissions` to submit a prompt for a task.
     - `POST /api/v1/evaluations` to submit an evaluation.
   - Review candidate prompts in `candidate_submissions/` and evaluation results in `evaluation_results/`.

**3. CLI Workflow (Legacy):**
   - Run an assessment:
     ```bash
     python -m promptcraft.cli --candidate <ID>
     ```
     (Ensure `OPENAI_API_KEY` environment variable is set for real LLM interaction if desired, otherwise it will use simulations.)
   - Review candidate prompts in `candidate_submissions/` and evaluation results in `evaluation_results/`.

## Deployment

**Local Development:**

- **Backend (FastAPI)**:
  ```bash
  pip install -r requirements.txt
  # Initialize databases (if not already done)
  python initialize_database.py
  # python exam_init.py # Optional
  # Set OPENAI_API_KEY (optional, for real LLM responses)
  export OPENAI_API_KEY='your_openai_api_key_here' 
  uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
  ```
- **Frontend (Next.js - Planned)**:
  Instructions will be added once the frontend is developed. Typically:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- **CLI (Legacy)**:
  ```bash
  pip install -r requirements.txt
  python initialize_database.py
  # Set OPENAI_API_KEY (optional)
  export OPENAI_API_KEY='your_openai_api_key_here'
  python -m promptcraft.cli --candidate alice
  ```

**Docker (To be updated):**
The current Dockerfile is for the CLI version. It will be updated to support the FastAPI backend and Next.js frontend.

## Example

Example session (interactive):
```text
--- Task 1 ---
Write a Python function that calculates the factorial of a number.

Please provide the prompt you would use to instruct an LLM to generate the code:
> I want a Python function factorial(n) that handles negative input with ValueError.

Submission recorded in 'candidate_submissions/alice_task1_20250427_044145.txt'
...
```

## Unit Test Report

The latest unit test report summary (see `unit_test_report.md`):
```text
.......                                                                  [100%]
7 passed in 0.15s
```

## Getting Started

1.  Clone this repository.
2.  **Install Python dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Initialize Databases**:
    - Run the initialization script for assessment tasks:
      ```bash
      python initialize_database.py
      ```
    - (Optional) Generate and initialize the exam question database:
      ```bash
      python exam_init.py
      ```
      This creates `exam_questions.db` from Markdown files in `./prompts/`.
4.  **Run the Application**:

    - **FastAPI Backend (Recommended for new development)**:
      Set your `OPENAI_API_KEY` environment variable if you want to use the actual OpenAI LLM:
      ```bash
      export OPENAI_API_KEY='your_actual_openai_api_key'
      ```
      Then run the Uvicorn server:
      ```bash
      uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
      ```
      You can access the API at `http://localhost:8000` and the auto-generated documentation at `http://localhost:8000/docs`.

    - **CLI (Legacy)**:
      (Optional) Set `OPENAI_API_KEY` as above.
      ```bash
      python -m promptcraft.cli --candidate your_candidate_id
      ```
5.  **(Planned)** Set up and run the Next.js frontend (details to come).

## Use Cases

- Technical interviews for software engineering roles
- Skills assessment for AI-augmented development capabilities
- Training and skill development for prompt engineering
- Evaluating team members' ability to work effectively with AI tools

## Running with Docker

The Docker setup will be updated to support the new FastAPI backend and the planned Next.js frontend. The current Dockerfile supports the legacy CLI application.

**Legacy CLI Docker Instructions:**
```bash
docker build -t promptcraft .
docker run -it --rm \
  -e CANDIDATE_ID=alice \
  -v "$(pwd)/candidate_submissions:/app/candidate_submissions" \
  -v "$(pwd)/evaluation_results:/app/evaluation_results" \
  promptcraft
```

## Software Licensing and Commercialization Plan

1. **Software Licensing:** Released under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), allowing free use, modification, and distribution with preservation of notices.
2. **Revenue Generation:** A one-time **USD 9.90** technical service fee applies to access the pre-packaged distribution, supporting ongoing development and maintenance.
3. **Payment Method:** We accept payments in **USD Coin (USDC)** and also welcome **Solana (SOL)** donations at our Phantom Wallet address:
   `ESUpLq9tCo1bmauWoN1rgNiYwwr5K587h15SrJz9L7ct`
4. **Custom Solutions:** Bespoke software development services are available. Contact us via Telegram at **@tonyironreal** to discuss your project needs.


## Running Unit Tests

After installing dependencies, you can run the full test suite and generate a Markdown report:
```bash
python run_unit_tests.py
```  
This will create `unit_test_report.md` in the project root, summarizing pytest output and exit code.

## Contributing

We welcome contributions to enhance PromptCraft's capabilities. Please see our contribution guidelines for more information.

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) 