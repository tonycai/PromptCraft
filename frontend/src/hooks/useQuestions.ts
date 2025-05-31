import { useState, useEffect } from 'react';
import { questionsApi } from '@/lib/api';
import type { QuestionBase, QuestionDetail } from '@/types';
import { toast } from 'react-hot-toast';

export function useQuestions() {
  const [questions, setQuestions] = useState<QuestionBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionsApi.getAll();
      setQuestions(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch questions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
  };
}

export function useQuestion(id: number) {
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const data = await questionsApi.getById(id);
      setQuestion(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch question details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  return {
    question,
    loading,
    error,
    refetch: fetchQuestion,
  };
}