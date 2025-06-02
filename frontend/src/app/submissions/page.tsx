'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { submissionsApi } from '@/lib/api';
import type { SubmissionHistoryItem } from '@/types';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;

  const fetchSubmissions = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await submissionsApi.getMySubmissions(pageNum, limit);
      
      if (pageNum === 1) {
        setSubmissions(response.submissions);
      } else {
        setSubmissions(prev => [...prev, ...response.submissions]);
      }
      
      setTotalCount(response.total_count);
      setHasMore(response.submissions.length === limit && (pageNum * limit) < response.total_count);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
      setError(err.response?.data?.detail || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSubmissions(page + 1);
    }
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && submissions.length === 0) {
    return (
      <SidebarLayout>
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">
            My Submissions
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Submissions</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={() => fetchSubmissions(1)}>Try Again</Button>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="border-b border-gray-200 pb-5 animate-fade-in-down">
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
          <div className="mt-6 animate-fade-in-up animate-delay-200">
            <Link href="/questions">
              <Button className="hover-lift">
                Browse Questions
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {submissions.map((submission, index) => (
            <Card 
              key={submission.id} 
              className={`hover-lift animate-fade-in-up ${
                index === 0 ? 'animate-delay-100' : 
                index === 1 ? 'animate-delay-200' : 
                index === 2 ? 'animate-delay-300' : 
                `animate-delay-${Math.min(400 + (index - 3) * 100, 800)}`
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {submission.question_description}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Question #{submission.question_id} • Submitted {new Date(submission.created_at).toLocaleDateString()}
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
                        {submission.generated_code}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {hasMore && (
            <div className="text-center py-6">
              <Button 
                onClick={loadMore} 
                disabled={loading}
                className="w-auto px-8 hover-lift"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
          
          {totalCount > 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                Showing {submissions.length} of {totalCount} submissions
              </p>
            </div>
          )}
        </div>
      )}
    </SidebarLayout>
  );
}