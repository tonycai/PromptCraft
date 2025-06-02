'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import type { EvaluationDetail } from '@/types';

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

// Helper function to get difficulty color
const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'hard': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'reviewed': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function EvaluationsPage() {
  const { user } = useAuthStore();
  const { getEvaluationsForCandidate, loading } = useEvaluations();
  const [evaluations, setEvaluations] = useState<EvaluationDetail[]>([]);

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (user) {
        // Create candidate ID based on user
        const candidateId = `user_${user.id}_${user.username}`;
        const result = await getEvaluationsForCandidate(candidateId);
        if (result) {
          setEvaluations(result);
        }
      }
    };

    fetchEvaluations();
  }, [user, getEvaluationsForCandidate]);

  if (loading) {
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
              My Evaluations
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              View expert evaluations and feedback on your prompt submissions.
            </p>
          </div>
          {evaluations.length > 0 && (
            <div className="text-sm text-gray-500">
              {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>

      {evaluations.length === 0 ? (
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
      ) : (
        <div className="mt-8 space-y-6">
          {evaluations.map((evaluation, index) => (
            <Card 
              key={evaluation.id} 
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
                  {(evaluations.reduce((sum, evaluation) => sum + (evaluation.overall_score || 0), 0) / evaluations.length).toFixed(1)}/10
                </span>
              </span>
              <span className="text-purple-600">
                Keep submitting to improve! 🚀
              </span>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}