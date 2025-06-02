'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

interface EvaluationFiltersProps {
  filters: FilterOptions;
  sorting: SortOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onSortingChange: (sorting: SortOptions) => void;
  onReset: () => void;
  availableOptions: {
    statuses: string[];
    difficulties: string[];
    languages: string[];
  };
}

export function EvaluationFilters({
  filters,
  sorting,
  onFiltersChange,
  onSortingChange,
  onReset,
  availableOptions
}: EvaluationFiltersProps) {
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
  };

  const handleSortChange = (sortBy: string) => {
    if (sorting.sortBy === sortBy) {
      onSortingChange({
        sortBy,
        sortOrder: sorting.sortOrder === 'asc' ? 'desc' : 'asc'
      });
    } else {
      onSortingChange({ sortBy, sortOrder: 'desc' });
    }
  };

  const getSortIcon = (sortBy: string) => {
    if (sorting.sortBy !== sortBy) return '↕️';
    return sorting.sortOrder === 'asc' ? '↗️' : '↘️';
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {availableOptions.statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                {availableOptions.difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={filters.language || ''}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Languages</option>
                {availableOptions.languages.map(language => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Score
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.minScore || ''}
                onChange={(e) => handleFilterChange('minScore', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Score
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.maxScore || ''}
                onChange={(e) => handleFilterChange('maxScore', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="10.0"
              />
            </div>
          </div>

          {/* Sort and Actions Row */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700 mr-2">Sort by:</span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange('date')}
              className={`flex items-center gap-1 ${sorting.sortBy === 'date' ? 'bg-purple-50 border-purple-300' : ''}`}
            >
              Date {getSortIcon('date')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange('score')}
              className={`flex items-center gap-1 ${sorting.sortBy === 'score' ? 'bg-purple-50 border-purple-300' : ''}`}
            >
              Score {getSortIcon('score')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange('task')}
              className={`flex items-center gap-1 ${sorting.sortBy === 'task' ? 'bg-purple-50 border-purple-300' : ''}`}
            >
              Task ID {getSortIcon('task')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange('status')}
              className={`flex items-center gap-1 ${sorting.sortBy === 'status' ? 'bg-purple-50 border-purple-300' : ''}`}
            >
              Status {getSortIcon('status')}
            </Button>

            <div className="flex-1"></div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="ml-auto"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}