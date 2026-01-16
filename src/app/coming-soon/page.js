'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const feature = searchParams.get('feature') || 'feature';

  const getFeatureTitle = (feature) => {
    switch (feature) {
      case 'resume-analysis':
        return 'Resume Analysis';
      case 'resume-builder':
        return 'Resume Builder';
      case 'job-matching':
        return 'Job Matching';
      case 'job-search':
        return 'Job Search';
      case 'customize-resume':
        return 'Customize Resume';
      case 'suggestions':
        return 'AI Suggestions';
      case 'settings':
        return 'Settings';
      case 'explore':
        return 'Explore Features';
      default:
        return 'This Feature';
    }
  };

  const getFeatureDescription = (feature) => {
    switch (feature) {
      case 'resume-analysis':
        return 'Get detailed AI-powered feedback and scoring on your resume to improve your chances of landing interviews.';
      case 'resume-builder':
        return 'Create professional resumes with our advanced builder featuring industry-specific templates and suggestions.';
      case 'job-matching':
        return 'Discover job opportunities that perfectly match your skills, experience, and career aspirations.';
      case 'job-search':
        return 'Search and apply to thousands of job opportunities from top companies around the world.';
      case 'customize-resume':
        return 'Customize your resume with professional templates, fonts, and layouts to make it stand out.';
      case 'suggestions':
        return 'Get intelligent suggestions to improve your resume content, keywords, and formatting.';
      case 'settings':
        return 'Manage your account preferences, notifications, and privacy settings.';
      case 'explore':
        return 'Explore all the powerful features Resumia has to offer for your career advancement.';
      default:
        return 'An exciting new feature that will help advance your career.';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Dark Background - Same as Dashboard */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center">
            {/* Main Coming Soon Card */}
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 glass rounded-full text-white/90 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Coming Soon
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                {getFeatureTitle(feature)}
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Coming Soon!
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
                {getFeatureDescription(feature)}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href="/dashboard" 
                  className="group relative px-8 py-4 bg-white text-indigo-600 rounded-2xl text-lg font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20"
                >
                  <span className="relative z-10">Back to Home</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </Link>
                
                <Link 
                  href="/homepage" 
                  className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all duration-300 hover:scale-105 glass"
                >
                  Go to Dashboard
                </Link>
              </div>

              {/* Timeline - Glass Effect */}
              <div className="glass rounded-3xl p-8 mb-12">
                <h3 className="text-xl font-bold text-white mb-6">Development Timeline</h3>
                <div className="flex justify-center items-center space-x-8">
                  <div className="text-center">
                    <div className="w-4 h-4 bg-green-400 rounded-full mx-auto mb-2 animate-pulse"></div>
                    <p className="text-sm font-medium text-white">Development</p>
                    <p className="text-xs text-white/60">In Progress</p>
                  </div>
                  <div className="w-16 h-1 bg-white/30 rounded"></div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-white">Testing</p>
                    <p className="text-xs text-white/60">Coming Soon</p>
                  </div>
                  <div className="w-16 h-1 bg-white/30 rounded"></div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-white/30 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-white">Launch</p>
                    <p className="text-xs text-white/60">Q3 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - White Background like Dashboard */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What to Expect</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our team is working hard to bring you cutting-edge features that will revolutionize your career journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Advanced algorithms will analyze your resume and provide personalized recommendations.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Professional Templates</h3>
              <p className="text-gray-600">
                Choose from industry-specific templates designed by career experts and HR professionals.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Secure & Private</h3>
              <p className="text-gray-600">
                Your data security and privacy are our top priorities with enterprise-grade protection.
              </p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-16 max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-8">
              Be the first to know when {getFeatureTitle(feature).toLowerCase()} launches.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                Notify Me
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - Same gradient as Dashboard */}
     <section className="py-20 bg-black">
               {/* Animated background elements for black section */}
               <div className="absolute inset-0 overflow-hidden">
                 <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
                 <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
               </div>
               
               <div className="relative z-10 container mx-auto px-4 text-center">
                 <div className="inline-flex items-center px-4 py-2 glass rounded-full text-white/90 text-sm font-medium mb-6 mx-auto">
                   <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                   Ready to Get Started?
                 </div>
                 
                 <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Career?</h2>
                 <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                   Join thousands of professionals who have successfully landed their dream jobs with Resumia.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Link 
                     href="/signup" 
                     className="group relative px-8 py-4 bg-white text-gray-900 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20"
                   >
                     <span className="relative z-10">Get Started Free</span>
                     <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                   </Link>
                   
                   <Link 
                     href="/login" 
                     className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all duration-300 hover:scale-105 glass"
                   >
                     Sign In
                   </Link>
                 </div>
     
                 {/* Additional stats or features in black section */}
                 <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white mb-2">250K+</div>
                     <div className="text-white/60 text-sm">Happy Users</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white mb-2">50+</div>
                     <div className="text-white/60 text-sm">Templates</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white mb-2">24/7</div>
                     <div className="text-white/60 text-sm">Support</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white mb-2">Free</div>
                     <div className="text-white/60 text-sm">To Start</div>
                   </div>
                 </div>
               </div>
             </section>
    </div>
  );
}

export default function ComingSoon() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    }>
      <ComingSoonContent />
    </Suspense>
  );
}
