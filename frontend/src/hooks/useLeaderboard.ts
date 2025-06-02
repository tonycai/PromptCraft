import { useState, useEffect } from 'react';
import { leaderboardApi } from '@/lib/api';
import type { LeaderboardResponse, UserStats } from '@/types';

export function useLeaderboard(params?: {
  limit?: number;
  offset?: number;
  period?: 'all_time' | 'monthly' | 'weekly';
  autoFetch?: boolean;
}) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await leaderboardApi.getLeaderboard(params);
      setLeaderboard(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchLeaderboard();
    }
  }, [params?.limit, params?.offset, params?.period]);

  return {
    leaderboard,
    isLoading,
    error,
    fetchLeaderboard,
    refetch: fetchLeaderboard,
  };
}

export function useUserStats(userId?: number, autoFetch: boolean = true) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await leaderboardApi.getUserStats(userId);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load user stats');
      console.error('Error fetching user stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await leaderboardApi.getMyStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load your stats');
      console.error('Error fetching my stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      if (userId) {
        fetchStats();
      }
    }
  }, [userId, autoFetch]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    fetchMyStats,
    refetch: userId ? fetchStats : fetchMyStats,
  };
}