import axios, { AxiosError } from 'axios';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  Token,
  QuestionBase,
  QuestionDetail,
  SubmissionRequest,
  SubmissionResponse,
  SubmissionHistoryResponse,
  SubmissionHistoryItem,
  EvaluationRequest,
  EvaluationResponse,
  ApiError,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://promptcraft-api.aiw3.ai/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<Token> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await api.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/users/me');
    return response.data;
  },

  requestEmailVerification: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/request-email-verification', { email });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
};

// Questions API
export const questionsApi = {
  getAll: async (): Promise<QuestionBase[]> => {
    const response = await api.get<QuestionBase[]>('/questions');
    return response.data;
  },

  getById: async (id: number): Promise<QuestionDetail> => {
    const response = await api.get<QuestionDetail>(`/questions/${id}`);
    return response.data;
  },
};

// Submissions API
export const submissionsApi = {
  create: async (data: SubmissionRequest): Promise<SubmissionResponse> => {
    const response = await api.post<SubmissionResponse>('/submissions', data);
    return response.data;
  },

  getMySubmissions: async (page: number = 1, limit: number = 20): Promise<SubmissionHistoryResponse> => {
    const response = await api.get<SubmissionHistoryResponse>('/submissions/my', {
      params: { page, limit }
    });
    return response.data;
  },

  getSubmissionById: async (submissionId: number): Promise<SubmissionHistoryItem> => {
    const response = await api.get<SubmissionHistoryItem>(`/submissions/${submissionId}`);
    return response.data;
  },
};

// Evaluations API
export const evaluationsApi = {
  create: async (
    candidateId: string,
    taskId: number,
    data: EvaluationRequest
  ): Promise<EvaluationResponse> => {
    const response = await api.post<EvaluationResponse>(
      `/evaluations/candidate/${candidateId}/task/${taskId}`,
      data
    );
    return response.data;
  },

  getForCandidate: async (candidateId: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/evaluations/candidate/${candidateId}`);
    return response.data;
  },
};

export default api;