'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useQuestion } from '@/hooks/useQuestions';
import { useSubmissions } from '@/hooks/useSubmissions';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { SubmissionResponse } from '@/types';

interface SubmissionFormData {
  prompt: string;
}

export default function SubmitQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = parseInt(params.id as string);
  const { question, loading: questionLoading } = useQuestion(questionId);
  const { submitPrompt, loading: submissionLoading } = useSubmissions();
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SubmissionFormData>();

  const promptValue = watch('prompt', '');

  const onSubmit = async (data: SubmissionFormData) => {
    const result = await submitPrompt({
      task_id: questionId,
      prompt: data.prompt,
    });

    if (result) {
      setSubmissionResult(result);
    }
  };

  if (questionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Question not found</p>
        <Link href="/questions">
          <Button variant="outline" className="mt-4">
            Back to Questions
          </Button>
        </Link>
      </div>
    );
  }

  if (submissionResult) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link href={`/questions/${questionId}`}>
            <Button variant="outline" size="sm">
              ← Back to Question
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold text-green-600">
                Submission Successful! 🎉
              </h1>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your prompt has been submitted and processed. Here's the AI-generated response:
              </p>
              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Generated Response:</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {submissionResult.generated_code}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="/submissions">
              <Button>
                View All Submissions
              </Button>
            </Link>
            <Link href="/questions">
              <Button variant="outline">
                Try Another Question
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link href={`/questions/${questionId}`}>
          <Button variant="outline" size="sm">
            ← Back to Question
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Question Reference */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Question #{question.id}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description:</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {question.description}
                  </p>
                </div>

                {question.expected_outcome && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Expected Outcome:</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {question.expected_outcome}
                    </p>
                  </div>
                )}

                {question.evaluation_criteria.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Evaluation Criteria:</h3>
                    <ul className="text-gray-700 text-sm space-y-1">
                      {question.evaluation_criteria.map((criterion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submission Form */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Submit Your Prompt
              </h2>
              <p className="text-sm text-gray-600">
                Craft a prompt that will generate the desired outcome. Be specific and clear.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Textarea
                  label="Your Prompt"
                  placeholder="Enter your prompt here..."
                  rows={10}
                  error={errors.prompt?.message}
                  {...register('prompt', {
                    required: 'Prompt is required',
                    minLength: {
                      value: 10,
                      message: 'Prompt must be at least 10 characters',
                    },
                  })}
                />

                <div className="text-sm text-gray-500">
                  Characters: {promptValue.length}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={submissionLoading}
                  disabled={!promptValue.trim()}
                >
                  Submit Prompt
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 Tips for better prompts:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be specific about what you want the AI to do</li>
              <li>• Provide context and examples when helpful</li>
              <li>• Use clear, unambiguous language</li>
              <li>• Consider the evaluation criteria when crafting your prompt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}