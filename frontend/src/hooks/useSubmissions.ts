import { useState } from 'react';
import { submissionsApi } from '@/lib/api';
import type { SubmissionRequest, SubmissionResponse, SubmissionHistoryResponse } from '@/types';
import { toast } from 'react-hot-toast';

export function useSubmissions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPrompt = async (data: SubmissionRequest): Promise<SubmissionResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await submissionsApi.create(data);
      toast.success('Submission successful!');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to submit prompt';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMySubmissions = async (page: number = 1, limit: number = 20): Promise<SubmissionHistoryResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await submissionsApi.getMySubmissions(page, limit);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch submissions';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitPrompt,
    getMySubmissions,
    loading,
    error,
  };
}