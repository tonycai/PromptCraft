'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { useLeaderboard, useUserStats } from '@/hooks/useLeaderboard';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  isPixelTheme?: boolean;
}

function LeaderboardCard({ entry, isCurrentUser = false, isPixelTheme = false }: LeaderboardCardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'text-gray-600 bg-gray-50 border-gray-200';
    if (rank === 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (rank <= 10) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-text-secondary bg-background-secondary border-border-subtle';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className={`transition-all duration-200 hover:scale-105 hover:shadow-lg ${
      isCurrentUser ? 'ring-2 ring-interactive-primary bg-background-accent' : 'bg-background-secondary'
    } ${isPixelTheme ? 'pixel-perfect' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Rank Badge */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg border-2 ${getRankColor(entry.rank)} ${isPixelTheme ? 'pixel-perfect' : ''}`}>
              {entry.badge || `#${entry.rank}`}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              {entry.profile_photo_url ? (
                <img
                  src={entry.profile_photo_url}
                  alt={`${entry.username}'s avatar`}
                  className={`w-12 h-12 rounded-full border-2 border-border-default ${isPixelTheme ? 'pixel-perfect' : ''}`}
                />
              ) : (
                <div className={`w-12 h-12 rounded-full bg-background-accent border-2 border-border-accent flex items-center justify-center ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                  <span className={`text-lg font-bold text-text-accent ${isPixelTheme ? 'font-pixel pixel-text' : ''}`}>
                    {entry.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div>
                <h3 className={`font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  {entry.full_name || entry.username}
                  {isCurrentUser && <span className="ml-2 text-text-accent">(You)</span>}
                </h3>
                <p className={`text-text-secondary text-sm ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  @{entry.username}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <div className={`text-2xl font-bold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              {entry.score}
            </div>
            <div className={`text-sm text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              {entry.total_submissions} submissions
            </div>
            <div className={`text-xs text-text-muted ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
              {entry.completed_questions} questions
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <div className="flex justify-between text-sm">
            <span className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              Last active: {formatDate(entry.recent_activity)}
            </span>
            <span className={`text-text-accent font-medium ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              Avg: {entry.avg_score}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CurrentUserStats() {
  const { user } = useAuthStore();
  const { isPixelTheme } = useTheme();
  const { stats, isLoading, error } = useUserStats(undefined, false);

  return (
    <Card className={`bg-background-accent border-border-accent ${isPixelTheme ? 'pixel-perfect' : ''}`}>
      <CardHeader>
        <h2 className={`text-xl font-semibold text-text-accent ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
          Your Performance
        </h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <div className={`animate-spin w-8 h-8 border-2 border-interactive-primary border-t-transparent rounded-full mx-auto ${isPixelTheme ? 'pixel-perfect' : ''}`}></div>
          </div>
        ) : error ? (
          <div className={`text-text-error text-sm ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
            {error}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
                #{stats.rank}
              </div>
              <div className={`text-sm text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                Rank
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
                {stats.avg_score}
              </div>
              <div className={`text-sm text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                Avg Score
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
                {stats.total_submissions}
              </div>
              <div className={`text-sm text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                Submissions
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
                {stats.percentile}%
              </div>
              <div className={`text-sm text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                Percentile
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-text-secondary text-center ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
            No stats available yet. Submit some prompts to get started!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const { isPixelTheme } = useTheme();
  const [period, setPeriod] = useState<'all_time' | 'monthly' | 'weekly'>('all_time');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { leaderboard, isLoading, error, refetch } = useLeaderboard({
    limit: pageSize,
    offset: currentPage * pageSize,
    period,
  });

  const handlePeriodChange = (newPeriod: 'all_time' | 'monthly' | 'weekly') => {
    setPeriod(newPeriod);
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      default: return 'All Time';
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold text-text-primary ${isPixelTheme ? 'font-pixel text-2xl pixel-text' : 'smooth-text'}`}>
              🏆 Leaderboard
            </h1>
            <p className={`mt-2 text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              See how you rank against other prompt crafters
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex bg-background-secondary rounded-default border border-border-default overflow-hidden">
            {(['all_time', 'monthly', 'weekly'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodChange(p)}
                className={`rounded-none border-0 ${isPixelTheme ? 'pixel-perfect' : ''}`}
              >
                {getPeriodLabel(p)}
              </Button>
            ))}
          </div>
        </div>

        {/* Current User Stats */}
        <CurrentUserStats />

        {/* Current User Position (if not in top entries) */}
        {leaderboard?.current_user_entry && leaderboard.current_user_rank && leaderboard.current_user_rank > pageSize && (
          <div>
            <h2 className={`text-lg font-semibold text-text-primary mb-4 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
              Your Position
            </h2>
            <LeaderboardCard 
              entry={leaderboard.current_user_entry} 
              isCurrentUser={true}
              isPixelTheme={isPixelTheme}
            />
          </div>
        )}

        {/* Leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
              Top Performers - {getPeriodLabel(period)}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
              className={isPixelTheme ? 'pixel-perfect' : ''}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className={`animate-spin w-12 h-12 border-4 border-interactive-primary border-t-transparent rounded-full mx-auto ${isPixelTheme ? 'pixel-perfect' : ''}`}></div>
              <p className={`mt-4 text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                Loading leaderboard...
              </p>
            </div>
          ) : error ? (
            <Card className={`bg-background-error border-border-error ${isPixelTheme ? 'pixel-perfect' : ''}`}>
              <CardContent className="text-center py-8">
                <p className={`text-text-error ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  {error}
                </p>
                <Button 
                  variant="outline" 
                  onClick={refetch} 
                  className={`mt-4 ${isPixelTheme ? 'pixel-perfect' : ''}`}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : leaderboard?.entries.length === 0 ? (
            <Card className={`bg-background-secondary ${isPixelTheme ? 'pixel-perfect' : ''}`}>
              <CardContent className="text-center py-8">
                <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  No rankings available for this period.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {leaderboard?.entries.map((entry) => (
                <LeaderboardCard
                  key={entry.user_id}
                  entry={entry}
                  isCurrentUser={entry.user_id === user?.id}
                  isPixelTheme={isPixelTheme}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {leaderboard && leaderboard.entries.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className={`text-sm text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, leaderboard.total_users)} of {leaderboard.total_users} users
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={isPixelTheme ? 'pixel-perfect' : ''}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={(currentPage + 1) * pageSize >= leaderboard.total_users}
                  className={isPixelTheme ? 'pixel-perfect' : ''}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}