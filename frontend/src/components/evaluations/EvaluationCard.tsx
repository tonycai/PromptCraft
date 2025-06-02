'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { EvaluationDetail } from '@/types';
import { formatDate, getDifficultyColor, getStatusColor } from '@/lib/utils/evaluationHelpers';

interface EvaluationCardProps {
  evaluation: EvaluationDetail;
  index: number;
}

export function EvaluationCard({ evaluation, index }: EvaluationCardProps) {
  return (
    <Card 
      className={`hover-lift animate-fade-in-up transition-all duration-200 hover:shadow-lg ${
        index === 0 ? 'animate-delay-100' : 
        index === 1 ? 'animate-delay-200' : 
        index === 2 ? 'animate-delay-300' : 
        `animate-delay-${Math.min(400 + (index - 3) * 100, 800)}`
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Question #{evaluation.task_id}
              </h3>
              {evaluation.difficulty_level && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(evaluation.difficulty_level)}`}>
                  {evaluation.difficulty_level}
                </span>
              )}
              {evaluation.programming_language && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {evaluation.programming_language}
                </span>
              )}
            </div>
            
            {evaluation.task_description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {evaluation.task_description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>Evaluated by</span>
                <span className="font-medium text-gray-700">
                  {evaluation.evaluator_full_name || evaluation.evaluator_username}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>{formatDate(evaluation.created_at)}</span>
              </div>
              {evaluation.submission_id && (
                <div className="flex items-center gap-1">
                  <span>•</span>
                  <span>Submission #{evaluation.submission_id}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
              {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
            </span>
            {evaluation.overall_score && (
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  {evaluation.overall_score}/10
                </div>
                <div className="text-xs text-gray-500">Overall Score</div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Your Prompt Section */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Your Prompt
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {evaluation.prompt_evaluated}
              </p>
            </div>
          </div>

          {/* Generated Code Section */}
          {evaluation.generated_code_evaluated && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Generated Code
              </h4>
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <pre className="text-sm text-blue-900 whitespace-pre-wrap font-mono overflow-x-auto">
                  {evaluation.generated_code_evaluated}
                </pre>
              </div>
            </div>
          )}

          {/* Evaluation Notes Section */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Expert Feedback
            </h4>
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-yellow-900 whitespace-pre-wrap">
                {evaluation.evaluation_notes}
              </p>
            </div>
          </div>

          {/* Scores Section */}
          {evaluation.scores && Object.keys(evaluation.scores).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Detailed Scores
              </h4>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(evaluation.scores).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-md p-3 shadow-sm">
                      <div className="text-xs text-green-600 font-medium uppercase tracking-wide">
                        {key.replace('_', ' ')}
                      </div>
                      <div className="text-lg font-bold text-green-800 mt-1">
                        {typeof value === 'number' ? value.toFixed(1) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Criteria Section */}
          {evaluation.evaluation_criteria_used && Object.keys(evaluation.evaluation_criteria_used).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Evaluation Criteria Used
              </h4>
              <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <div className="space-y-2">
                  {Object.entries(evaluation.evaluation_criteria_used).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></span>
                      <div className="flex-1">
                        <span className="font-medium text-indigo-900">{key}:</span>{' '}
                        <span className="text-indigo-700">{String(value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}