'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuestion } from '@/hooks/useQuestions';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function QuestionDetailPage() {
  const params = useParams();
  const questionId = parseInt(params.id as string);
  const { question, loading, error } = useQuestion(questionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Question not found'}</p>
        <Link href="/questions">
          <Button variant="outline" className="mt-4">
            Back to Questions
          </Button>
        </Link>
      </div>
    );
  }

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link href="/questions">
          <Button variant="outline" size="sm">
            ← Back to Questions
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Question #{question.id}
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  {question.difficulty_level && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                        question.difficulty_level
                      )}`}
                    >
                      {question.difficulty_level}
                    </span>
                  )}
                  {question.programming_language && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {question.programming_language}
                    </span>
                  )}
                </div>
              </div>
              <Link href={`/questions/${question.id}/submit`}>
                <Button>
                  Submit Solution
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {question.description}
            </p>
          </CardContent>
        </Card>

        {question.expected_outcome && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Expected Outcome
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {question.expected_outcome}
              </p>
            </CardContent>
          </Card>
        )}

        {question.evaluation_criteria && question.evaluation_criteria.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Evaluation Criteria
              </h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {question.evaluation_criteria.map((criterion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{criterion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Ready to Submit?
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Craft your prompt carefully, considering the description, expected outcome, and evaluation criteria above.
          </p>
          <Link href={`/questions/${question.id}/submit`}>
            <Button>
              Start Working on This Question
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}