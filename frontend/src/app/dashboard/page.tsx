'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">
          Welcome back, {user?.username || 'User'}!
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Ready to test your prompting skills? Choose from our collection of challenges below.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/questions"
          className="group relative rounded-lg p-6 bg-white shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
              Practice Questions
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Browse and attempt prompting challenges across different domains and difficulty levels.
            </p>
          </div>
          <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        <Link
          href="/submissions"
          className="group relative rounded-lg p-6 bg-white shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
              My Submissions
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              View your submitted prompts and generated responses from AI models.
            </p>
          </div>
          <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        <Link
          href="/evaluations"
          className="group relative rounded-lg p-6 bg-white shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600">
              Evaluations
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Review expert evaluations and feedback on your prompt submissions.
            </p>
          </div>
          <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-900 mb-2">
          Getting Started
        </h2>
        <p className="text-sm text-blue-700 mb-4">
          New to PromptCraft? Here's how to get the most out of the platform:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
          <li>Browse the available questions and select one that interests you</li>
          <li>Craft a prompt that you think will generate the desired outcome</li>
          <li>Submit your prompt and review the AI-generated response</li>
          <li>Wait for expert evaluation and feedback to improve your skills</li>
        </ol>
      </div>
    </div>
  );
}