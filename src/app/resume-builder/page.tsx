'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Open-resume URL - change this based on deployment
  const RESUME_BUILDER_URL = process.env.NEXT_PUBLIC_RESUME_BUILDER_URL || 'http://localhost:3001';

  useEffect(() => {
    // Check if open-resume is running
    fetch(RESUME_BUILDER_URL)
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const openInNewTab = () => {
    window.open(RESUME_BUILDER_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Resume Builder
          </h1>
          <p className="text-gray-600">
            Create professional resumes with our advanced builder
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">📝 Interactive Resume Builder</h2>
            <p className="text-blue-100">
              Build your resume with real-time preview and professional templates
            </p>
          </div>

          <div className="p-8">
            {/* Option 1: Embedded iframe */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Option 1: Embedded Builder (Recommended)
              </h3>
              <div className="border-4 border-gray-200 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src={RESUME_BUILDER_URL}
                  className="w-full h-full"
                  title="Resume Builder"
                  onError={() => setIsLoading(true)}
                />
              </div>
              {isLoading && (
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-yellow-700">
                    <strong>Note:</strong> The resume builder service needs to be running separately.
                  </p>
                </div>
              )}
            </div>

            {/* Option 2: Open in new tab */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Option 2: Open in New Tab
              </h3>
              <button
                onClick={openInNewTab}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                🚀 Open Resume Builder in New Tab
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Opens the resume builder in a new window for better experience
              </p>
            </div>

            {/* Option 3: Alternative tools */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Other Resume Tools
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border-2 border-blue-200 transition text-left"
                >
                  <h4 className="font-bold text-lg text-blue-900 mb-2">📤 Upload & Analyze</h4>
                  <p className="text-blue-700">
                    Upload your existing resume and get AI-powered feedback
                  </p>
                </button>

                <button
                  onClick={() => router.push('/parse-resume')}
                  className="bg-green-50 hover:bg-green-100 p-6 rounded-lg border-2 border-green-200 transition text-left"
                >
                  <h4 className="font-bold text-lg text-green-900 mb-2">🔍 Parse Resume</h4>
                  <p className="text-green-700">
                    Extract structured data from your resume automatically
                  </p>
                </button>
              </div>
            </div>

            {/* Back button */}
            <div className="mt-8 text-center">
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
    </div>
  );
}
