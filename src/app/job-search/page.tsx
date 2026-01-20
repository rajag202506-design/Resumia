'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function JobSearch() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStats, setSearchStats] = useState<{
    totalResults: number;
    searchTimeMs: number;
    jobsBySource: { [key: string]: number };
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !location.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Construct the URL with search parameters for a GET request
      const searchUrl = `/api/jobs/search?query=${encodeURIComponent(query.trim())}&location=${encodeURIComponent(location.trim())}`;
      
      const response = await fetch(searchUrl);

      if (response.ok) {
        const data = await response.json();
        // The API returns a `matchingJobs` array
        setJobs(data.matchingJobs || []);
        setSearchStats({
          totalResults: data.matchingJobs?.length || 0,
          // These stats are not yet provided by the Google API route, so we'll use placeholders
          searchTimeMs: 500, // Placeholder
          jobsBySource: { google: data.matchingJobs?.length || 0 } // Placeholder
        });
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const formatSearchTime = (ms: number) => {
    return ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  };

  return (
    <>
      {/* Add CSS for animations and gradients - matching dashboard theme */}
      <style jsx>{`
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

        .job-card-hover {
          transition: all 0.3s ease;
        }

        .job-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-glow {
          from { box-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
          to { box-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="min-h-screen">
        {/* SECTION 1: Hero Section with Search - BLACK BACKGROUND */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg">
          {/* Animated background elements - same as dashboard */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 glass rounded-full text-white/90 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                AI-Powered Job Search
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Find Your
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Dream Job
                </span>
              </h1>

              <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
                Search and discover thousands of job opportunities from top companies worldwide.
                Our intelligent crawler finds the latest positions that match your skills and location.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
                <div className="glass rounded-3xl p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Job title, keywords, or company..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Location (city, country)..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="group relative px-8 py-4 bg-white text-indigo-600 rounded-2xl text-lg font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isSearching ? (
                          <>
                            <svg className="w-5 h-5 mr-2 spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Searching...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search Jobs
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    </button>
                  </div>
                </div>
              </form>

              {/* Search Stats */}
              {searchStats && (
                <div className="flex items-center justify-center gap-8 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{searchStats.totalResults}</div>
                    <div className="text-white/60 text-sm">Jobs Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{formatSearchTime(searchStats.searchTimeMs)}</div>
                    <div className="text-white/60 text-sm">Search Time</div>
                  </div>
                </div>
              )}

              {/* Back to Dashboard */}
              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 border-2 border-white/30 text-white rounded-2xl font-medium hover:bg-white/10 transition-all duration-300 hover:scale-105 glass"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Results Section - WHITE BACKGROUND */}
        {hasSearched && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              {jobs.length > 0 ? (
                <>
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Job Search Results</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Found {jobs.length} opportunities for "{query}" in "{location}"
                    </p>
                  </div>

                  <div className="grid gap-6 max-w-4xl mx-auto">
                    {jobs.map((job: any, index: number) => (
                      <div
                        key={job.id}
                        className="job-card-hover bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zM8 5a1 1 0 011-1h2a1 1 0 011 1v1H8V5z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {job.company}
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {job.location}
                                  </div>
                                  {job.salary !== 'Not specified' && (
                                    <div className="flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                      </svg>
                                      {job.salary}
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                  {job.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    Found: {new Date(job.foundAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0 flex items-center">
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                              Apply Now
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Jobs Found</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    We couldn't find any jobs matching your criteria. Try adjusting your search terms or location.
                  </p>
                  <button
                    onClick={() => {setQuery(''); setLocation(''); setJobs([]); setHasSearched(false);}}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Try New Search
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 3: CTA Section - BLACK BACKGROUND (same as dashboard) */}
        <section className="py-20 bg-black relative">
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
              Combine our intelligent job search with AI-powered resume analysis to land your dream job faster.
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
                href="/dashboard"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all duration-300 hover:scale-105 glass"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Additional stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">1M+</div>
                <div className="text-white/60 text-sm">Jobs Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">5</div>
                <div className="text-white/60 text-sm">Job Sources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">Real-Time</div>
                <div className="text-white/60 text-sm">Updates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">Free</div>
                <div className="text-white/60 text-sm">To Use</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}