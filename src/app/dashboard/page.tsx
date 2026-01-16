'use client';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <>
      {/* Add CSS for animations and gradients */}
      <style jsx>{`67
        .gradient-bg {
          background: #0a0a0a;
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .float {
          animation: float 6s ease-in-out infinite;
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          from { box-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
          to { box-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
        }
      `}</style>

      <div className="min-h-screen">
        {/* SECTION 1: Hero Section - BLACK BACKGROUND */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Side - Content */}
              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 glass rounded-full text-white/90 text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  AI-Powered Resume Builder
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Build Your
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Dream Career
                  </span>
                </h1>
                
                <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-2xl">
                  Create professional, ATS-friendly resumes in minutes with our AI-powered builder. 
                  Stand out from the competition and land your dream job with beautiful, modern templates.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/signup" 
                    className="group relative px-8 py-4 bg-white text-indigo-600 rounded-2xl text-lg font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20"
                  >
                    <span className="relative z-10">Start Building Free</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                  </Link>
                  
                  <Link 
                    href="/login" 
                    className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all duration-300 hover:scale-105 glass"
                  >
                    Sign In
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center lg:justify-start gap-8 mt-12">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">10K+</div>
                    <div className="text-white/60 text-sm">Resumes Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">95%</div>
                    <div className="text-white/60 text-sm">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">4.9/5</div>
                    <div className="text-white/60 text-sm">User Rating</div>
                  </div>
                </div>
              </div>

              {/* Right Side - 3D Resume Illustration */}
              <div className="lg:w-1/2 flex justify-center">
                <div className="relative">
                  {/* Main resume card */}
                  <div className="relative w-80 h-96 glass rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500 float">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="h-3 bg-white/70 rounded-full w-24 mb-1"></div>
                        <div className="h-2 bg-white/50 rounded-full w-20"></div>
                      </div>
                    </div>

                    {/* Content lines */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-2 bg-white/60 rounded-full w-full"></div>
                        <div className="h-2 bg-white/60 rounded-full w-4/5"></div>
                        <div className="h-2 bg-white/60 rounded-full w-3/4"></div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-2 bg-white/60 rounded-full w-full"></div>
                        <div className="h-2 bg-white/60 rounded-full w-5/6"></div>
                      </div>

                      <div className="space-y-2">
                        <div className="h-2 bg-white/60 rounded-full w-full"></div>
                        <div className="h-2 bg-white/60 rounded-full w-2/3"></div>
                        <div className="h-2 bg-white/60 rounded-full w-4/5"></div>
                      </div>
                    </div>

                    {/* Checkmark */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center pulse-glow">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center transform rotate-12 float" style={{animationDelay: '1s'}}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>

                  <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-pink-400 rounded-2xl flex items-center justify-center transform -rotate-12 float" style={{animationDelay: '2s'}}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Features Section - WHITE BACKGROUND */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Resumia?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of professionals who have transformed their careers with our AI-powered resume builder.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Get intelligent feedback and suggestions to improve your resume's impact and ATS compatibility.
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Job Matching</h3>
                <p className="text-gray-600">
                  Discover opportunities that match your skills and get recommendations to improve your candidacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CTA Section - BLACK BACKGROUND */}
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
    </>
  );
}