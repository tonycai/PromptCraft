import { useState } from 'react';
import { submissionsApi } from '@/lib/api';
import type { SubmissionRequest, SubmissionResponse } from '@/types';
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

  return {
    submitPrompt,
    loading,
    error,
  };
}