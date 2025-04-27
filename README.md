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
   python promptcraft.py --candidate candidate_id
   ```

## Use Cases

- Technical interviews for software engineering roles
- Skills assessment for AI-augmented development capabilities
- Training and skill development for prompt engineering
- Evaluating team members' ability to work effectively with AI tools

## Software Licensing and Commercialization Plan

1.  **Software Licensing:**
    The software will be released under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). This permissive open-source license allows for broad adoption, modification, and distribution, including commercial use, while requiring the preservation of copyright notices and disclaimers.

2.  **Revenue Generation - Software Access Fee:**
    A one-time **USD 9.90** technical service fee will be applied for accessing and utilizing the pre-packaged software distribution. This fee is intended to support ongoing development, maintenance, and the provision of convenient access to the software. It is important to note that the underlying software remains open-source under the terms of the Apache License 2.0, allowing technically proficient users the option to build and utilize the software independently without incurring this fee.

3.  **Payment Method:**
    We will primarily accept payments in **USD Coin (USDC)** for the aforementioned software access fee. Details regarding the payment process will be clearly outlined on our designated platform.

    **We also accept Solana (SOL) donations at the following Phantom Wallet address:**
    `ESUpLq9tCo1bmauWoN1rgNiYwwr5K587h15SrJz9L7ct`

4.  **Custom Project Solutions:**
    In addition to the standard software offering, we provide bespoke software definition and development services tailored to specific client requirements. Interested parties are invited to discuss their unique project needs and explore potential collaborations by contacting us via Telegram at **@tonyironreal**.

## Contributing

We welcome contributions to enhance PromptCraft's capabilities. Please see our contribution guidelines for more information.

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) 