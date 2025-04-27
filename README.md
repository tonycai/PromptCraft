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

## Getting Started

1. Clone this repository
2. Install required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the initialization script to set up the SQLite database:
   ```
   python initialize_database.py
   ```
4. Start using PromptCraft to create and administer assessments:
   ```
   python promptcraft.py
   ```

## Use Cases

- Technical interviews for software engineering roles
- Skills assessment for AI-augmented development capabilities
- Training and skill development for prompt engineering
- Evaluating team members' ability to work effectively with AI tools

## Contributing

We welcome contributions to enhance PromptCraft's capabilities. Please see our contribution guidelines for more information.

## License

[Specify your license here] 