'use client';

import { Button } from '@/components/ui/Button';

interface EvaluationEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function EvaluationEmptyState({ isFiltered = false, onClearFilters }: EvaluationEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations match your filters</h3>
        <p className="text-sm text-gray-500 mb-6">
          Try adjusting your filter criteria to see more results.
        </p>
        <Button onClick={onClearFilters} variant="outline">
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
      >
        <path
          d="M9 12l2 2 4-4m5 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No evaluations yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Submit some prompts to receive expert evaluations and feedback.
      </p>
      <div className="mt-6 animate-fade-in-up animate-delay-200">
        <Button onClick={() => window.location.href = '/questions'} className="hover-lift">
          Start Submitting
        </Button>
      </div>
    </div>
  );
}