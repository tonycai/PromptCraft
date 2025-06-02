import { useState } from 'react';
import { evaluationsApi } from '@/lib/api';
import type { EvaluationRequest, EvaluationResponse, EvaluationDetail } from '@/types';
import { toast } from 'react-hot-toast';

export function useEvaluations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvaluation = async (
    candidateId: string,
    taskId: number,
    data: EvaluationRequest
  ): Promise<EvaluationResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await evaluationsApi.create(candidateId, taskId, data);
      toast.success('Evaluation created successfully!');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create evaluation';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getEvaluationsForCandidate = async (candidateId: string): Promise<EvaluationDetail[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await evaluationsApi.getForCandidate(candidateId);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch evaluations';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEvaluation,
    getEvaluationsForCandidate,
    loading,
    error,
  };
}