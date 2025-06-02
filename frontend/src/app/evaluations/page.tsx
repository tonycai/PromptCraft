'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Button } from '@/components/ui/Button';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EvaluationCard } from '@/components/evaluations/EvaluationCard';
import { EvaluationFilters } from '@/components/evaluations/EvaluationFilters';
import { EvaluationStats } from '@/components/evaluations/EvaluationStats';
import { EvaluationEmptyState } from '@/components/evaluations/EvaluationEmptyState';
import type { EvaluationDetail } from '@/types';
import { sortEvaluations, filterEvaluations, calculateAverageScore } from '@/lib/utils/evaluationHelpers';

interface FilterOptions {
  status?: string;
  difficulty?: string;
  language?: string;
  minScore?: number;
  maxScore?: number;
}

interface SortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function EvaluationsPage() {
  const { user } = useAuthStore();
  const { getEvaluationsForCandidate, loading, error } = useEvaluations();
  
  // State management
  const [evaluations, setEvaluations] = useState<EvaluationDetail[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sorting, setSorting] = useState<SortOptions>({ sortBy: 'date', sortOrder: 'desc' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch evaluations
  const fetchEvaluations = useCallback(async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      const candidateId = `user_${user.id}_${user.username}`;
      const result = await getEvaluationsForCandidate(candidateId);
      if (result) {
        setEvaluations(result);
      }
    } catch (err) {
      console.error('Failed to fetch evaluations:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, getEvaluationsForCandidate]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  // Memoized calculations
  const availableOptions = useMemo(() => {
    const statuses = Array.from(new Set(evaluations.map(e => e.status)));
    const difficulties = Array.from(new Set(evaluations.map(e => e.difficulty_level).filter((d): d is string => Boolean(d))));
    const languages = Array.from(new Set(evaluations.map(e => e.programming_language).filter((l): l is string => Boolean(l))));
    
    return { statuses, difficulties, languages };
  }, [evaluations]);

  const filteredAndSortedEvaluations = useMemo(() => {
    let result = filterEvaluations(evaluations, filters);
    result = sortEvaluations(result, sorting.sortBy, sorting.sortOrder);
    return result;
  }, [evaluations, filters, sorting]);

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const handleSortingChange = useCallback((newSorting: SortOptions) => {
    setSorting(newSorting);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setSorting({ sortBy: 'date', sortOrder: 'desc' });
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchEvaluations();
  }, [fetchEvaluations]);

  // Loading state
  if (loading && evaluations.length === 0) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </SidebarLayout>
    );
  }

  // Error state
  if (error && evaluations.length === 0) {
    return (
      <SidebarLayout>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load evaluations</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Button onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  const hasFilters = Object.values(filters).some(value => value !== undefined);
  const isFiltered = hasFilters && filteredAndSortedEvaluations.length !== evaluations.length;

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 animate-fade-in-down">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-6 text-gray-900">
              My Evaluations
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              View expert evaluations and feedback on your prompt submissions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
              Refresh
            </Button>
            {evaluations.length > 0 && (
              <div className="text-sm text-gray-500">
                {filteredAndSortedEvaluations.length} of {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {evaluations.length === 0 ? (
          <EvaluationEmptyState />
        ) : (
          <>
            {/* Statistics */}
            <EvaluationStats 
              evaluations={evaluations}
              filteredCount={filteredAndSortedEvaluations.length}
            />

            {/* Filters */}
            <EvaluationFilters
              filters={filters}
              sorting={sorting}
              onFiltersChange={handleFiltersChange}
              onSortingChange={handleSortingChange}
              onReset={handleResetFilters}
              availableOptions={availableOptions}
            />

            {/* Results */}
            {filteredAndSortedEvaluations.length === 0 ? (
              <EvaluationEmptyState 
                isFiltered={isFiltered}
                onClearFilters={handleResetFilters}
              />
            ) : (
              <div className="space-y-6">
                {filteredAndSortedEvaluations.map((evaluation, index) => (
                  <EvaluationCard
                    key={evaluation.id}
                    evaluation={evaluation}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 animate-fade-in-up animate-delay-500 hover-lift">
              <h3 className="text-lg font-medium text-purple-900 mb-2 flex items-center gap-2">
                <span className="text-xl">📊</span>
                About Evaluations
              </h3>
              <p className="text-sm text-purple-700 leading-relaxed">
                Expert evaluators review your prompts based on specific criteria such as clarity, 
                effectiveness, and how well the generated output meets the requirements. Each evaluation 
                includes detailed feedback, scores across multiple dimensions, and actionable insights 
                to help you improve your prompting skills. The overall score reflects your performance 
                on a scale of 1-10.
              </p>
              {evaluations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-700">
                      Your average score: 
                      <span className="ml-1 font-bold text-purple-800">
                        {calculateAverageScore(evaluations).toFixed(2)}/10
                      </span>
                    </span>
                    <span className="text-purple-600">
                      Keep submitting to improve! 🚀
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}