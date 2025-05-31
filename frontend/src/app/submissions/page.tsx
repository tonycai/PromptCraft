'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// This would typically come from an API call
// For now, we'll show a placeholder since the backend doesn't have a "get my submissions" endpoint
export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      // For now, we'll show empty state since we don't have user submissions endpoint
      setSubmissions([]);
    }, 1000);
  }, []);

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
          My Submissions
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          View all your submitted prompts and their AI-generated responses.
        </p>
      </div>

      {submissions.length === 0 ? (
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by attempting some practice questions to see your submissions here.
          </p>
          <div className="mt-6">
            <Link href="/questions">
              <Button>
                Browse Questions
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {submissions.map((submission, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Question #{submission.questionId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Submitted
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Your Prompt:</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {submission.prompt}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">AI Response:</h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <pre className="text-sm text-blue-900 whitespace-pre-wrap font-mono">
                        {submission.generatedCode}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">
          📝 Note
        </h3>
        <p className="text-sm text-yellow-700">
          The submissions history feature is currently being developed. 
          Your submissions are being recorded, but the display functionality 
          will be available in a future update.
        </p>
      </div>
    </div>
  );
}