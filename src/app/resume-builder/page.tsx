'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResumeBuilderPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Open Resume builder or show a coming soon message
    // For now, we'll show a message that it's in development
    console.log('Resume Builder Page Loaded');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Resume Builder
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create professional resumes with our advanced builder
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> The resume builder is currently running as a separate service.
                  For the full resume building experience with templates, please contact support.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-blue-900 mb-2">Upload & Analyze</h3>
              <p className="text-blue-700 mb-4">
                Upload your existing resume and get AI-powered feedback
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Go to Dashboard
              </button>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-green-900 mb-2">Parse Resume</h3>
              <p className="text-green-700 mb-4">
                Extract information from your resume automatically
              </p>
              <button
                onClick={() => router.push('/parse-resume')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              >
                Parse Resume
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
