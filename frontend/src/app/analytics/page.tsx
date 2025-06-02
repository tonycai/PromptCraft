'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import type { DashboardAnalytics, MetricSummary, TimePeriod } from '@/types';

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to format percentages to 2 decimal places
const formatPercentage = (num: number): string => {
  return num.toFixed(2);
};

// Helper function to get trend color and icon
const getTrendDisplay = (trend: string, changePercent: number) => {
  const absChange = Math.abs(changePercent);
  switch (trend) {
    case 'up':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '↗️',
        text: `+${formatPercentage(absChange)}%`
      };
    case 'down':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '↘️',
        text: `-${formatPercentage(absChange)}%`
      };
    default:
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: '➡️',
        text: `${formatPercentage(absChange)}%`
      };
  }
};

// Helper function to format date for charts
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Simple line chart component
const SimpleLineChart = ({ data, title, color = '#8B5CF6' }: {
  data: Array<{ timestamp: string; value: number; label?: string }>;
  title: string;
  color?: string;
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="relative h-32 bg-gray-50 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 400 100">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = 100 - ((point.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                className="hover:r-4 transition-all"
              />
            );
          })}
        </svg>
        
        {/* Value labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
          {data.length > 0 && (
            <>
              <span>{formatDate(data[0].timestamp)}</span>
              <span>{formatDate(data[data.length - 1].timestamp)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Metric card component
const MetricCard = ({ metric }: { metric: MetricSummary }) => {
  const trendDisplay = getTrendDisplay(metric.trend, metric.change_percent);
  
  // Format value based on unit type
  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return formatPercentage(value);
    }
    return formatNumber(value);
  };
  
  return (
    <Card className="hover-lift transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with trend indicator */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600 truncate pr-2">{metric.name}</p>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${trendDisplay.bgColor} ${trendDisplay.color}`}>
              <span className="text-xs">{trendDisplay.icon}</span>
              <span className="whitespace-nowrap">{trendDisplay.text}</span>
            </div>
          </div>
          
          {/* Main value */}
          <div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              {formatValue(metric.current_value, metric.unit)}{metric.unit && ` ${metric.unit}`}
            </p>
          </div>
          
          {/* Previous value */}
          {metric.previous_value > 0 && (
            <p className="text-xs text-gray-500">
              Previous: {formatValue(metric.previous_value, metric.unit)}{metric.unit && ` ${metric.unit}`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Distribution chart component
const DistributionChart = ({ data, title, colors }: {
  data: Record<string, number>;
  title: string;
  colors: string[];
}) => {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [_, value]) => sum + value, 0);
  
  if (total === 0) {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="space-y-2">
        {entries.map(([key, value], index) => {
          const percentage = ((value / total) * 100).toFixed(1);
          const color = colors[index % colors.length];
          
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm text-gray-700 capitalize">{key}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{value}</span>
                <span className="text-xs text-gray-500">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const { getDashboardAnalytics, exportAnalytics, loading } = useAnalytics();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');

  useEffect(() => {
    const fetchAnalytics = async () => {
      const result = await getDashboardAnalytics();
      if (result) {
        setAnalytics(result);
      }
    };

    fetchAnalytics();
  }, [getDashboardAnalytics]);

  const handleExport = async () => {
    await exportAnalytics('json', ['users', 'submissions', 'engagement'], selectedPeriod);
  };

  const handleRefresh = async () => {
    const result = await getDashboardAnalytics();
    if (result) {
      setAnalytics(result);
    }
  };

  if (loading && !analytics) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="border-b border-gray-200 pb-5 animate-fade-in-down">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-6 text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Comprehensive insights into platform usage, user engagement, and performance metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center gap-2"
            >
              📥 Export Data
            </Button>
          </div>
        </div>
      </div>

      {!analytics ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
          <p className="text-sm text-gray-500 mb-6">
            Analytics data could not be loaded. Please try refreshing the page.
          </p>
          <Button onClick={handleRefresh} disabled={loading}>
            Try Again
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Key Metrics */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {analytics.key_metrics.map((metric, index) => (
                <div
                  key={metric.name}
                  className={`animate-fade-in-up min-w-0 ${
                    index === 0 ? 'animate-delay-100' : 
                    index === 1 ? 'animate-delay-200' : 
                    index === 2 ? 'animate-delay-300' : 
                    'animate-delay-400'
                  }`}
                >
                  <MetricCard metric={metric} />
                </div>
              ))}
            </div>
          </section>

          {/* Overview Cards */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Engagement */}
              <Card className="animate-fade-in-up animate-delay-100">
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-blue-600">👥</span>
                    User Engagement
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{formatNumber(analytics.user_engagement.total_users)}</p>
                      <p className="text-xs text-gray-500">Total Users</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{formatNumber(analytics.user_engagement.verified_users)}</p>
                      <p className="text-xs text-gray-500">Verified</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-purple-600">{analytics.user_engagement.active_users_month}</p>
                      <p className="text-xs text-gray-500">Active This Month</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-orange-600">{formatPercentage(analytics.user_engagement.retention_rate)}%</p>
                      <p className="text-xs text-gray-500">Retention Rate</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Today: {analytics.user_engagement.active_users_today}</span>
                      <span className="text-gray-600">Week: {analytics.user_engagement.active_users_week}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Metrics */}
              <Card className="animate-fade-in-up animate-delay-200">
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-green-600">📝</span>
                    Submissions
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{formatNumber(analytics.submission_metrics.total_submissions)}</p>
                      <p className="text-xs text-gray-500">Total Submissions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{formatPercentage(analytics.submission_metrics.avg_submissions_per_user)}</p>
                      <p className="text-xs text-gray-500">Avg per User</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-purple-600">{analytics.submission_metrics.submissions_month}</p>
                      <p className="text-xs text-gray-500">This Month</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-orange-600">{formatPercentage(analytics.submission_metrics.completion_rate)}%</p>
                      <p className="text-xs text-gray-500">Completion Rate</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Today: {analytics.submission_metrics.submissions_today}</span>
                      <span className="text-gray-600">Week: {analytics.submission_metrics.submissions_week}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Metrics */}
              <Card className="animate-fade-in-up animate-delay-300">
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-purple-600">❓</span>
                    Questions
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{analytics.question_metrics.total_questions}</p>
                      <p className="text-xs text-gray-500">Total Questions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{analytics.question_metrics.questions_with_submissions}</p>
                      <p className="text-xs text-gray-500">With Submissions</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-blue-600">{formatPercentage(analytics.question_metrics.avg_submissions_per_question)}</p>
                    <p className="text-xs text-gray-500">Avg Submissions per Question</p>
                  </div>
                  {analytics.question_metrics.most_popular_question_title && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Most Popular:</p>
                      <p className="text-sm font-medium text-gray-700 line-clamp-2">
                        {analytics.question_metrics.most_popular_question_title}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Time Series Charts */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trends</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-fade-in-up animate-delay-100">
                <CardContent className="p-6">
                  <SimpleLineChart
                    data={analytics.time_series.submissions || []}
                    title="Daily Submissions (Last 30 Days)"
                    color="#10B981"
                  />
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in-up animate-delay-200">
                <CardContent className="p-6">
                  <SimpleLineChart
                    data={analytics.time_series.new_users || []}
                    title="New User Registrations (Last 30 Days)"
                    color="#3B82F6"
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Distribution Charts */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distributions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-fade-in-up animate-delay-100">
                <CardContent className="p-6">
                  <DistributionChart
                    data={analytics.question_metrics.difficulty_distribution}
                    title="Question Difficulty Distribution"
                    colors={['bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-gray-500']}
                  />
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in-up animate-delay-200">
                <CardContent className="p-6">
                  <DistributionChart
                    data={analytics.question_metrics.language_distribution}
                    title="Programming Language Distribution"
                    colors={['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500']}
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* System Information */}
          <section className="animate-fade-in-up animate-delay-300">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Analytics Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium">Data Freshness</p>
                    <p className="text-blue-600">Real-time updates</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Coverage Period</p>
                    <p className="text-blue-600">Last 30 days for trends</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Next Update</p>
                    <p className="text-blue-600">Automatic refresh available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </SidebarLayout>
  );
}