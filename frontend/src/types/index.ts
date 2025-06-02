export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
  profile_photo_url?: string;
  profile_photo_ipfs_hash?: string;
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
  submission_id: number;
  generated_code: string;
  message: string;
  submitted_by_user_id: number;
}

export interface SubmissionHistoryItem {
  id: number;
  question_id: number;
  question_description: string;
  prompt: string;
  generated_code: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionHistoryResponse {
  submissions: SubmissionHistoryItem[];
  total_count: number;
  page: number;
  limit: number;
}

export interface EvaluationRequest {
  task_id: number;
  submission_id?: number;
  prompt_evaluated: string;
  generated_code_evaluated?: string;
  evaluation_notes: string;
  scores?: Record<string, any>;
  overall_score?: number;
}

export interface EvaluationResponse {
  evaluation_id: number;
  message: string;
  evaluator_user_id: number;
}

export interface EvaluationDetail {
  id: number;
  candidate_id: string;
  task_id: number;
  submission_id?: number;
  evaluator_user_id: number;
  evaluator_username: string;
  prompt_evaluated: string;
  generated_code_evaluated?: string;
  evaluation_notes: string;
  evaluation_criteria_used?: Record<string, any>;
  scores?: Record<string, any>;
  overall_score?: number;
  status: string;
  created_at: string;
  updated_at: string;
  task_description?: string;
  programming_language?: string;
  difficulty_level?: string;
  evaluator_username_full?: string;
  evaluator_full_name?: string;
}

export interface ApiError {
  error_type: string;
  detail: string;
}

// Pinata/IPFS related types
export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface PinataFileInfo {
  ipfs_pin_hash: string;
  size: number;
  user_id: string;
  date_pinned: string;
  date_unpinned?: string;
  metadata: {
    name?: string;
    keyvalues?: Record<string, any>;
  };
  regions: Array<{
    regionId: string;
    currentReplicationCount: number;
    desiredReplicationCount: number;
  }>;
}

export interface IPFSEvaluationData {
  candidateId: string;
  taskId: number;
  prompt: string;
  generatedCode?: string;
  evaluationNotes: string;
  scores?: Record<string, any>;
  evaluatorId: number;
  evaluatorUsername: string;
  timestamp: string;
  ipfsHash?: string;
}

export interface IPFSSubmissionData {
  userId: number;
  taskId: number;
  prompt: string;
  generatedCode: string;
  timestamp: string;
  ipfsHash?: string;
}

export interface PinataListOptions {
  status?: 'pinned' | 'unpinned';
  pageLimit?: number;
  offset?: number;
  metadata?: Record<string, any>;
  cidPending?: boolean;
}

export interface PinataMetadata {
  name?: string;
  keyvalues?: Record<string, any>;
}

// Profile photo related types
export interface ProfilePhotoUploadRequest {
  file: File;
}

export interface ProfilePhotoUpdateRequest {
  profile_photo_url?: string;
  profile_photo_ipfs_hash?: string;
}

export interface ProfilePhotoUploadResponse {
  profile_photo_url: string;
  profile_photo_ipfs_hash: string;
  message: string;
}

export interface UserProfileUpdateRequest {
  full_name?: string;
  profile_photo_url?: string;
  profile_photo_ipfs_hash?: string;
}

// Leaderboard related types
export interface LeaderboardEntry {
  user_id: number;
  username: string;
  full_name?: string;
  profile_photo_url?: string;
  rank: number;
  score: number;
  total_submissions: number;
  completed_questions: number;
  avg_score: number;
  recent_activity?: string;
  badge?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total_users: number;
  current_user_rank?: number;
  current_user_entry?: LeaderboardEntry;
}

export interface UserStats {
  user_id: number;
  username: string;
  total_submissions: number;
  completed_questions: number;
  avg_score: number;
  best_score: number;
  recent_submissions: number;
  streak_days: number;
  rank: number;
  percentile: number;
}

// Analytics related types
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface MetricSummary {
  name: string;
  current_value: number;
  previous_value: number;
  change_percent: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export interface UserEngagementMetrics {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  new_users_today: number;
  new_users_week: number;
  new_users_month: number;
  verified_users: number;
  retention_rate: number;
}

export interface SubmissionMetrics {
  total_submissions: number;
  submissions_today: number;
  submissions_week: number;
  submissions_month: number;
  avg_submissions_per_user: number;
  avg_code_length: number;
  avg_prompt_length: number;
  completion_rate: number;
}

export interface QuestionMetrics {
  total_questions: number;
  questions_with_submissions: number;
  avg_submissions_per_question: number;
  most_popular_question_id?: number;
  most_popular_question_title?: string;
  difficulty_distribution: Record<string, number>;
  language_distribution: Record<string, number>;
}

export interface DashboardAnalytics {
  user_engagement: UserEngagementMetrics;
  submission_metrics: SubmissionMetrics;
  question_metrics: QuestionMetrics;
  key_metrics: MetricSummary[];
  time_series: Record<string, TimeSeriesPoint[]>;
}

export interface AnalyticsExportResponse {
  generated_at: string;
  generated_by: string;
  period: string;
  dashboard_analytics: DashboardAnalytics;
  [key: string]: any;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type MetricType = 'users' | 'submissions' | 'questions' | 'engagement';