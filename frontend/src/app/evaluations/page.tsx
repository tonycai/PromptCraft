'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function EvaluationsPage() {
  const { user } = useAuthStore();
  const { getEvaluationsForCandidate, loading } = useEvaluations();
  const [evaluations, setEvaluations] = useState<any[]>([]);

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">
          My Evaluations
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          View expert evaluations and feedback on your prompt submissions.
        </p>
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
          <div className="mt-6">
            <Button onClick={() => window.location.href = '/questions'}>
              Start Submitting
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {evaluations.map((evaluation, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Question #{evaluation.task_id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Evaluated by {evaluation.evaluator_username}
                    </p>
                    {evaluation.submission_id && (
                      <p className="text-xs text-gray-400">
                        Submission ID: {evaluation.submission_id}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Evaluated
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Your Prompt:</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {evaluation.prompt_evaluated}
                      </p>
                    </div>
                  </div>

                  {evaluation.generated_code_evaluated && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Generated Code:</h4>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <pre className="text-sm text-blue-900 whitespace-pre-wrap font-mono">
                          {evaluation.generated_code_evaluated}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Evaluator Notes:</h4>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-sm text-yellow-900 whitespace-pre-wrap">
                        {evaluation.evaluation_notes}
                      </p>
                    </div>
                  </div>

                  {evaluation.scores && Object.keys(evaluation.scores).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Scores:</h4>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(evaluation.scores).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-green-900">{key}:</span>{' '}
                              <span className="text-green-700">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {evaluation.evaluation_criteria_used && evaluation.evaluation_criteria_used.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Evaluation Criteria Used:</h4>
                      <ul className="space-y-1">
                        {evaluation.evaluation_criteria_used.map((criterion: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-purple-900 mb-2">
          📊 About Evaluations
        </h3>
        <p className="text-sm text-purple-700">
          Expert evaluators review your prompts based on specific criteria such as clarity, 
          effectiveness, and how well the generated output meets the requirements. 
          Use this feedback to improve your prompting skills.
        </p>
      </div>
    </div>
  );
}