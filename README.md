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

PromptCraft is implemented as a Python framework with the following key features:

- SQLite database for storing code generation tasks and evaluation criteria
- Interface for presenting tasks to candidates and collecting their prompts
- Integration options with real LLM APIs (e.g., OpenAI, Google Cloud)
- Structured output and reporting for easy assessment
- Support for various programming languages and difficulty levels

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

PromptCraft is composed of:
- **SQLite Databases**:
  - `promptcraft_questions.db` for interactive CLI tasks.
  - `exam_questions.db` for exam questions extracted from Markdown prompts.
- **CLI Interface** (`promptcraft.cli`):
  - Presents tasks, captures prompts, simulates LLM responses, records evaluations.
- **TaskHandler**:
  - Manages task presentation and submission recording.
- **Evaluator**:
  - Records structured evaluation results.
- **Initialization Scripts**:
  - `initialize_database.py`: Seeds initial coding tasks.
  - `exam_init.py`: Extracts exam questions from `./prompts/`.
- **Dockerfile**:
  - Containerized deployment for consistent environments.

## Workflow

1. Initialize the task database:
   ```bash
   python initialize_database.py
   ```
2. (Optional) Generate exam questions:
   ```bash
   python exam_init.py
   ```
3. Run an assessment:
   ```bash
   python -m promptcraft.cli --candidate <ID>
   ```
4. Review candidate prompts in `candidate_submissions/` and evaluation results in `evaluation_results/`.

## Deployment

Deploy locally or via Docker:
- **Local Python**:
  ```bash
  pip install -r requirements.txt
  python initialize_database.py
  python -m promptcraft.cli --candidate alice
  ```
- **Docker**:
  ```bash
  docker build -t promptcraft .
  docker run -it --rm -e CANDIDATE_ID=alice promptcraft -- --candidate alice
  ```

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

1. Clone this repository
2. Install required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the initialization script to set up the PromptCraft tasks database (for assessments):
   ```
   python initialize_database.py
   ```
4. (Optional) Generate and initialize the exam question database from the AI prompt guides:
   ```
   python exam_init.py
   ```
   This will create `exam_questions.db` in the project root and populate it with exam questions extracted from the Markdown files under `./prompts/`.
5. Start using PromptCraft to create and administer assessments:
   ```bash
   python -m promptcraft.cli --candidate candidate_id
   ```

## Use Cases

- Technical interviews for software engineering roles
- Skills assessment for AI-augmented development capabilities
- Training and skill development for prompt engineering
- Evaluating team members' ability to work effectively with AI tools

## Running with Docker

You can containerize PromptCraft using the provided Dockerfile.

1. Build the image:
   ```bash
   docker build -t promptcraft .
   ```
2. Run the CLI interactively (set candidate via flag or env var):
   ```bash
   docker run -it --rm \
     -e CANDIDATE_ID=alice \
     promptcraft -- --candidate alice
   ```
   Or rely on the environment variable alone:
   ```bash
   docker run -it --rm \
     -e CANDIDATE_ID=alice \
     promptcraft
   ```

By default, the databases are initialized at build time. To persist submissions or evaluation results, mount volumes:
```bash
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