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
  EvaluationDetail,
  ApiError,
  UserProfileUpdateRequest,
  LeaderboardResponse,
  UserStats,
  DashboardAnalytics,
  AnalyticsExportResponse,
  TimePeriod,
  MetricType,
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
  console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 API: Auth token attached');
    } else {
      console.log('⚠️ API: No auth token found');
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error('📄 Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 API: 401 Unauthorized - clearing tokens and redirecting');
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
    console.log('🔐 AuthAPI: Starting login for user:', data.username);
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    console.log('🚀 AuthAPI: Sending login request...');
    const response = await api.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log('✅ AuthAPI: Login successful, received token');
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    console.log('👤 AuthAPI: Getting current user...');
    const response = await api.get<User>('/auth/users/me');
    console.log('✅ AuthAPI: User data received:', { id: response.data.id, username: response.data.username });
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

  updateProfile: async (data: UserProfileUpdateRequest): Promise<User> => {
    const response = await api.patch<User>('/auth/users/me', data);
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

  getForCandidate: async (candidateId: string): Promise<EvaluationDetail[]> => {
    const response = await api.get<EvaluationDetail[]>(`/evaluations/candidate/${candidateId}`);
    return response.data;
  },

  // IPFS-enabled evaluation endpoints
  createWithIPFS: async (
    candidateId: string,
    taskId: number,
    data: EvaluationRequest & { save_to_ipfs?: boolean }
  ): Promise<EvaluationResponse & { ipfs_hash?: string }> => {
    const response = await api.post(
      `/evaluations-ipfs/candidate/${candidateId}/task/${taskId}`,
      { ...data, save_to_ipfs: true }
    );
    return response.data;
  },

  getForCandidateWithIPFS: async (candidateId: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/evaluations-ipfs/candidate/${candidateId}`);
    return response.data;
  },

  getFromIPFS: async (ipfsHash: string): Promise<any> => {
    const response = await api.get<any>(`/evaluations-ipfs/ipfs/${ipfsHash}`);
    return response.data;
  },

  listIPFSFiles: async (): Promise<{ files: any[]; count: number }> => {
    const response = await api.get<{ files: any[]; count: number }>('/evaluations-ipfs/list-ipfs-files');
    return response.data;
  },
};

// Leaderboard API
export const leaderboardApi = {
  getLeaderboard: async (params?: {
    limit?: number;
    offset?: number;
    period?: 'all_time' | 'monthly' | 'weekly';
  }): Promise<LeaderboardResponse> => {
    console.log('🏆 LeaderboardAPI: Getting leaderboard...');
    const response = await api.get<LeaderboardResponse>('/leaderboard', { params });
    console.log(`✅ LeaderboardAPI: Retrieved ${response.data.entries.length} entries`);
    return response.data;
  },

  getUserStats: async (userId: number): Promise<UserStats> => {
    console.log(`📊 LeaderboardAPI: Getting stats for user ${userId}...`);
    const response = await api.get<UserStats>(`/leaderboard/stats/${userId}`);
    console.log(`✅ LeaderboardAPI: User stats retrieved for ${response.data.username}`);
    return response.data;
  },

  getMyStats: async (): Promise<UserStats> => {
    console.log('📊 LeaderboardAPI: Getting my stats...');
    const response = await api.get<UserStats>('/leaderboard/my-stats');
    console.log(`✅ LeaderboardAPI: My stats retrieved`);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    console.log('📈 AnalyticsAPI: Getting dashboard analytics...');
    const response = await api.get<DashboardAnalytics>('/analytics/dashboard');
    console.log(`✅ AnalyticsAPI: Dashboard analytics retrieved`);
    return response.data;
  },

  getMetrics: async (
    metricType: MetricType,
    period: TimePeriod = 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<any> => {
    console.log(`📊 AnalyticsAPI: Getting ${metricType} metrics for ${period}...`);
    const params: any = { period };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get(`/analytics/metrics/${metricType}`, { params });
    console.log(`✅ AnalyticsAPI: ${metricType} metrics retrieved`);
    return response.data;
  },

  exportData: async (
    format: 'json' | 'csv' = 'json',
    metricTypes: MetricType[] = ['users', 'submissions'],
    period: TimePeriod = 'monthly'
  ): Promise<AnalyticsExportResponse> => {
    console.log(`📥 AnalyticsAPI: Exporting analytics in ${format} format...`);
    const response = await api.get<AnalyticsExportResponse>('/analytics/export', {
      params: {
        format,
        metric_types: metricTypes,
        period
      }
    });
    console.log(`✅ AnalyticsAPI: Analytics exported successfully`);
    return response.data;
  },

  checkHealth: async (): Promise<{ status: string; service: string; timestamp: string; database: string }> => {
    console.log('🏥 AnalyticsAPI: Checking analytics service health...');
    const response = await api.get('/analytics/health');
    console.log(`✅ AnalyticsAPI: Health check completed - ${response.data.status}`);
    return response.data;
  },
};

export default api;