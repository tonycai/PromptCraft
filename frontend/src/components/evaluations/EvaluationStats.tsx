'use client';

import { Card, CardContent } from '@/components/ui/Card';
import type { EvaluationDetail } from '@/types';
import { calculateAverageScore, getScoreColor } from '@/lib/utils/evaluationHelpers';

interface EvaluationStatsProps {
  evaluations: EvaluationDetail[];
  filteredCount: number;
}

export function EvaluationStats({ evaluations, filteredCount }: EvaluationStatsProps) {
  const totalEvaluations = evaluations.length;
  const averageScore = calculateAverageScore(evaluations);
  
  // Calculate status distribution
  const statusCounts = evaluations.reduce((acc, evaluation) => {
    acc[evaluation.status] = (acc[evaluation.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate difficulty distribution
  const difficultyCounts = evaluations.reduce((acc, evaluation) => {
    if (evaluation.difficulty_level) {
      acc[evaluation.difficulty_level] = (acc[evaluation.difficulty_level] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Find best and worst scores
  const scores = evaluations.map(e => e.overall_score).filter(s => s !== undefined) as number[];
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Count */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalEvaluations}</div>
            <div className="text-sm text-gray-500">Total Evaluations</div>
            {filteredCount !== totalEvaluations && (
              <div className="text-xs text-purple-600 mt-1">
                ({filteredCount} shown)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore.toFixed(1)}/10
            </div>
            <div className="text-sm text-gray-500">Average Score</div>
            <div className="text-xs text-gray-400 mt-1">
              Range: {worstScore.toFixed(1)} - {bestScore.toFixed(1)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 mb-2">Status</div>
            <div className="space-y-1">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm">
                  <span className="capitalize">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Distribution */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 mb-2">Difficulty</div>
            <div className="space-y-1">
              {Object.entries(difficultyCounts).map(([difficulty, count]) => (
                <div key={difficulty} className="flex justify-between text-sm">
                  <span className="capitalize">{difficulty}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(difficultyCounts).length === 0 && (
                <div className="text-xs text-gray-400">No data</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}