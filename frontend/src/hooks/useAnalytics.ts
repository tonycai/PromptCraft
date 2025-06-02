import { useState, useCallback } from 'react';
import { analyticsApi } from '@/lib/api';
import type { 
  DashboardAnalytics, 
  AnalyticsExportResponse, 
  TimePeriod, 
  MetricType 
} from '@/types';
import { toast } from 'react-hot-toast';

export function useAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboardAnalytics = useCallback(async (): Promise<DashboardAnalytics | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.getDashboard();
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch analytics dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMetrics = async (
    metricType: MetricType,
    period: TimePeriod = 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.getMetrics(metricType, period, startDate, endDate);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || `Failed to fetch ${metricType} metrics`;
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async (
    format: 'json' | 'csv' = 'json',
    metricTypes: MetricType[] = ['users', 'submissions'],
    period: TimePeriod = 'monthly'
  ): Promise<AnalyticsExportResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.exportData(format, metricTypes, period);
      toast.success('Analytics data exported successfully!');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to export analytics data';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkAnalyticsHealth = async (): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.checkHealth();
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Analytics service health check failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getDashboardAnalytics,
    getMetrics,
    exportAnalytics,
    checkAnalyticsHealth,
    loading,
    error,
  };
}