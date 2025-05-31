'use client';

import Link from 'next/link';
import { useQuestions } from '@/hooks/useQuestions';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function QuestionsPage() {
  const { questions, loading, error } = useQuestions();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">
          Practice Questions
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Choose a question to test your prompting skills. Each question has specific criteria and expected outcomes.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No questions available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later for new prompting challenges.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Question #{question.id}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {question.description}
                </p>
                <div className="flex justify-between items-center">
                  <Link href={`/questions/${question.id}`}>
                    <Button size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/questions/${question.id}/submit`}>
                    <Button variant="outline" size="sm">
                      Submit Solution
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}