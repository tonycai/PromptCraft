export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface QuestionBase {
  id: number;
  description: string;
}

export interface QuestionDetail extends QuestionBase {
  expected_outcome?: string;
  evaluation_criteria: string[];
  programming_language?: string;
  difficulty_level?: string;
}

export interface SubmissionRequest {
  task_id: number;
  prompt: string;
}

export interface SubmissionResponse {
  submission_file: string;
  generated_code: string;
  message: string;
  submitted_by_user_id: number;
}

export interface EvaluationRequest {
  task_id: number;
  submission_id?: string;
  prompt_evaluated: string;
  generated_code_evaluated?: string;
  evaluation_notes: string;
  scores?: Record<string, any>;
}

export interface EvaluationResponse {
  evaluation_file: string;
  message: string;
  evaluator_user_id: number;
}

export interface ApiError {
  error_type: string;
  detail: string;
}