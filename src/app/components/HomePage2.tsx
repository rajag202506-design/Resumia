'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Resume {
  id: number;
  original_name: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  parsed_data: string | null;
  extracted_text: string | null;
}

interface ParsedData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  education: string[];
  experience: string[];
  skills: string[];
  extractedAt: string;
}

export default function HomePageContent() {
  const [userName, setUserName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    setUserName(name || 'User');
    loadMyResumes();
  }, []);

  const loadMyResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const response = await fetch('/api/my-resumes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const validateFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload only PDF or DOCX files.';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB.';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const error = validateFile(selectedFile);
      if (error) {
        setUploadError(error);
        setShowErrorPopup(true);
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Upload successful:', data);
        alert(`Resume uploaded successfully! File: ${data.originalName}, Size: ${(data.size / 1024).toFixed(2)} KB`);
        
        setFile(null);
        const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        loadMyResumes();
      } else {
        setUploadError(data.error || 'Upload failed');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload failed. Please try again.');
      setShowErrorPopup(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleParseResume = async (resumeId: number) => {
    setIsParsing(true);
    
    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ resumeId }),
      });

      const data = await response.json();

      if (response.ok) {
        setParsedData(data.parsedData);
        loadMyResumes();
        alert('Resume parsed successfully!');
      } else {
        alert('Parsing failed: ' + data.error);
      }
    } catch (error) {
      console.error('Parse error:', error);
      alert('Parsing failed. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleViewResume = (resume: Resume) => {
    setSelectedResume(resume);
    setShowResumeViewer(true);
    if (resume.parsed_data) {
      try {
        setParsedData(JSON.parse(resume.parsed_data));
      } catch (error) {
        console.error('Error parsing resume data:', error);
      }
    }
  };

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setUploadError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    router.push('/dashboard');
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <>
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
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar - Fixed positioning */}
        <div className={`fixed left-0 top-0 h-full w-64 glass shadow-lg z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">Resumia</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Items */}
            <div className="space-y-4">
              {/* Upload Resume - Active */}
              <div className="flex items-center p-3 rounded-xl bg-white/20 border border-white/30">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="font-semibold text-white">Upload Resume</span>
              </div>

              {/* Other Navigation Items */}
              <Link href="/coming-soon?feature=customize-resume" className="block">
                <div className="flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span className="font-medium text-white/80 hover:text-white">Customize Resume</span>
                </div>
              </Link>

              <Link href="/job-search" className="block">
                <div className="flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <span className="font-medium text-white/80 hover:text-white">Job Search</span>
                </div>
              </Link>

              <Link href="/coming-soon?feature=suggestions" className="block">
                <div className="flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="font-medium text-white/80 hover:text-white">AI Suggestions</span>
                </div>
              </Link>
            </div>

            {/* User Profile Section */}
            <div className="border-t border-white/20 pt-6 mt-8">
              <div className="flex items-center mb-4 p-3 rounded-xl bg-white/10">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <span className="font-semibold text-white">{userName}</span>
              </div>
              
              <div className="space-y-2">
                <Link href="/coming-soon?feature=settings" className="flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 text-white/80 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white/80 hover:text-white font-medium">Settings</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors w-full text-left"
                >
                  <svg className="w-5 h-5 text-white/80 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-white/80 hover:text-white font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Hero Section - BLACK BACKGROUND */}
        <section className="relative min-h-screen overflow-hidden gradient-bg">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
          </div>

          <div className="ml-0 md:ml-64 relative z-10">
            <div className="flex items-center justify-between p-6 lg:p-8">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="hidden md:block flex-1 max-w-md ml-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search features, jobs, templates..."
                    className="w-full px-4 py-3 pl-12 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-white/60 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center space-x-4 ml-4">
                <button className="p-3 bg-white/20 border border-white/30 rounded-xl text-white hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 1h5v5L4 1z" />
                  </svg>
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-500 hover:to-emerald-600 transition-all duration-300 hover:scale-105 shadow-lg">
                  Quick Analyze
                </button>
              </div>
            </div>

            <div className="container mx-auto px-6 lg:px-8 py-12">
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 glass rounded-full text-white/90 text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Welcome back, {userName}!
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Elevate Your Career with
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    AI-Powered Tools
                  </span>
                </h1>
                
                <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-3xl mx-auto">
                  Upload your resume, get instant feedback, discover matching jobs, and build your professional future with our comprehensive AI platform.
                </p>

                <div className="max-w-2xl mx-auto mb-16">
                  <div className="glass rounded-3xl p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Upload Your Resume</h3>
                      <p className="text-white/80">Get instant AI-powered analysis and feedback</p>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="resume-upload"
                          className="flex items-center justify-center w-full p-6 border-2 border-dashed border-white/30 rounded-2xl cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all duration-300"
                        >
                          <div className="text-center">
                            <svg className="w-12 h-12 text-white/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="text-white font-semibold">
                              {file ? file.name : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-white/60 text-sm mt-1">PDF or DOCX files only (Max 10MB)</p>
                          </div>
                        </label>
                      </div>

                      {file && (
                        <button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="group relative w-full px-8 py-4 bg-white text-gray-900 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="relative z-10">
                            {isUploading ? 'Analyzing Resume...' : 'Analyze Resume'}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                        </button>
                      )}

                      <Link
                        href="/coming-soon?feature=explore"
                        className="block w-full px-8 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all duration-300 hover:scale-105 glass text-center"
                      >
                        Explore All Features
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {[
                    { number: '98%', label: 'Success Rate' },
                    { number: '24hr', label: 'Avg. Analysis Time' },
                    { number: '250K+', label: 'Users Helped' },
                    { number: '500+', label: 'Partner Companies' }
                  ].map((stat, index) => (
                    <div key={index} className="glass rounded-2xl p-6 text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.number}</div>
                      <div className="text-white/80 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 hidden xl:block">
              <div className="relative">
                <div className="relative w-80 h-96 glass rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500 float">
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

                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center pulse-glow">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

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
        </section>

        {/* SECTION 2: My Resumes - WHITE BACKGROUND */}
        <section className="py-20 bg-white">
          <div className="ml-0 md:ml-64 container mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800">My Resumes</h2>
              <button 
                onClick={loadMyResumes}
                disabled={isLoadingResumes}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isLoadingResumes ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {isLoadingResumes ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-3xl">
                <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No resumes uploaded yet</h3>
                <p className="text-gray-600 mb-6">Upload your first resume to get started with AI-powered analysis!</p>
                <label
                  htmlFor="resume-upload-empty"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Resume
                </label>
                <input
                  type="file"
                  id="resume-upload-empty"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <div key={resume.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
                          {resume.mime_type === 'application/pdf' ? (
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm truncate max-w-[150px]" title={resume.original_name}>
                            {resume.original_name}
                          </h3>
                          <p className="text-xs text-gray-500">{formatFileSize(resume.file_size)}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        resume.parsed_data ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {resume.parsed_data ? 'Analyzed' : 'Pending'}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-6">
                      Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleViewResume(resume)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        View
                      </button>
                      {!resume.parsed_data ? (
                        <button
                          onClick={() => handleParseResume(resume.id)}
                          disabled={isParsing}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {isParsing ? 'Parsing...' : 'Analyze'}
                        </button>
                      ) : (
                        // Replace the "View Analysis" button onClick handler in your HomePage.tsx
// Find this section and replace it:

<button
  onClick={() => {
    try {
      console.log('Raw parsed_data:', resume.parsed_data);
      
      if (!resume.parsed_data) {
        alert('No analysis data available. Please analyze the resume first.');
        return;
      }
      
      let parsedDataObj;
      
      if (typeof resume.parsed_data === 'string') {
        parsedDataObj = JSON.parse(resume.parsed_data);
      } else if (typeof resume.parsed_data === 'object') {
        parsedDataObj = resume.parsed_data;
      } else {
        alert('Invalid analysis data format.');
        return;
      }
      
      console.log('Parsed data object:', parsedDataObj);
      setParsedData(parsedDataObj);
      
    } catch (error) {
      console.error('Error loading analysis data:', error);
      alert('Error loading analysis data. The data might be corrupted. Please analyze the resume again.');
    }
  }}
  className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors"
>
  View Analysis
</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: Features Section - BLACK BACKGROUND */}
        <section className="py-20 bg-black">
          <div className="ml-0 md:ml-64 container mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Powerful Career Tools</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Everything you need to land your dream job, powered by artificial intelligence
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Link href="/coming-soon?feature=resume-analysis" className="group">
                <div className="bg-white/10 backdrop-filter backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Resume Analysis</h3>
                  <p className="text-white/80 mb-6">
                    Get detailed feedback and scoring on your resume with AI-powered analysis and actionable insights.
                  </p>
                  <span className="text-blue-400 font-semibold group-hover:text-blue-300">
                    Learn More →
                  </span>
                </div>
              </Link>

              <Link href="/coming-soon?feature=resume-builder" className="group">
                <div className="bg-white/10 backdrop-filter backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Resume Builder</h3>
                  <p className="text-white/80 mb-6">
                    Create professional resumes with industry-specific templates and AI-powered content suggestions.
                  </p>
                  <span className="text-green-400 font-semibold group-hover:text-green-300">
                    Learn More →
                  </span>
                </div>
              </Link>

              <Link href="/coming-soon?feature=job-matching" className="group">
                <div className="bg-white/10 backdrop-filter backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Smart Job Matching</h3>
                  <p className="text-white/80 mb-6">
                    Discover opportunities that match your skills, experience, and career goals with intelligent algorithms.
                  </p>
                  <span className="text-purple-400 font-semibold group-hover:text-purple-300">
                    Learn More →
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 4: CTA Section - WHITE BACKGROUND */}
        <section className="py-20 bg-white">
          <div className="ml-0 md:ml-64 container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Ready to Transform Your Career?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have successfully advanced their careers with Resumia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/coming-soon?feature=get-started"
                className="group relative px-8 py-4 bg-indigo-600 text-white rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-indigo-500/20"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </Link>
              <Link 
                href="/coming-soon?feature=learn-more"
                className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-2xl text-lg font-bold hover:bg-indigo-50 transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Resume Viewer Modal */}
        {showResumeViewer && selectedResume && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">{selectedResume.original_name}</h3>
                <button
                  onClick={() => {
                    setShowResumeViewer(false);
                    setSelectedResume(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                {selectedResume.mime_type === 'application/pdf' ? (
                  <div className="w-full">
                    <iframe
                      src={`/api/get-resume/${selectedResume.id}?token=${localStorage.getItem('token')}`}
                      className="w-full h-[600px] border border-gray-300 rounded-xl"
                      title={selectedResume.original_name}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-2xl text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">DOCX Preview Not Available</h4>
                    <p className="text-gray-600 mb-4">Word documents cannot be previewed in the browser.</p>
                    <a 
                      href={`/api/get-resume/${selectedResume.id}?token=${localStorage.getItem('token')}`}
                      download={selectedResume.original_name}
                      className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Parsed Data Display Modal */}
        {parsedData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800">Resume Analysis</h2>
                <button
                  onClick={() => setParsedData(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      {parsedData.personalInfo.name && (
                        <div className="bg-white p-4 rounded-xl">
                          <span className="font-semibold text-gray-700 block mb-1">Name:</span>
                          <p className="text-gray-800">{parsedData.personalInfo.name}</p>
                        </div>
                      )}
                      {parsedData.personalInfo.email && (
                        <div className="bg-white p-4 rounded-xl">
                          <span className="font-semibold text-gray-700 block mb-1">Email:</span>
                          <p className="text-gray-800">{parsedData.personalInfo.email}</p>
                        </div>
                      )}
                      {parsedData.personalInfo.phone && (
                        <div className="bg-white p-4 rounded-xl">
                          <span className="font-semibold text-gray-700 block mb-1">Phone:</span>
                          <p className="text-gray-800">{parsedData.personalInfo.phone}</p>
                        </div>
                      )}
                      {!parsedData.personalInfo.name && !parsedData.personalInfo.email && !parsedData.personalInfo.phone && (
                        <p className="text-gray-500 text-center py-4">No personal information found</p>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.length > 0 ? (
                        parsedData.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-medium">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4 w-full">No skills found</p>
                      )}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      Education
                    </h3>
                    <div className="space-y-3">
                      {parsedData.education.length > 0 ? (
                        parsedData.education.map((edu, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-gray-700">{edu}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No education information found</p>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                      Experience
                    </h3>
                    <div className="space-y-3">
                      {parsedData.experience.length > 0 ? (
                        parsedData.experience.map((exp, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-gray-700">{exp}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No experience information found</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Analysis Summary Footer */}
                <div className="mt-8 text-center bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-gray-700">Analysis Complete</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Analysis completed on: {new Date(parsedData.extractedAt).toLocaleString()}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setParsedData(null)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Close Analysis
                    </button>
                    <Link
                      href="/coming-soon?feature=improve-resume"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Get Improvement Tips
                    </Link>
                    <Link
                      href="/coming-soon?feature=job-matching"
                      className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      Find Matching Jobs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Popup Modal */}
        {showErrorPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Error</h3>
                <p className="text-gray-600 mb-6">{uploadError}</p>
                
                {/* Error Details */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Supported formats:</span>
                      <span className="text-gray-600">PDF, DOCX</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Maximum size:</span>
                      <span className="text-gray-600">10MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Allowed extensions:</span>
                      <span className="text-gray-600">.pdf, .docx</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={closeErrorPopup}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <label
                    htmlFor="resume-upload-retry"
                    className="flex-1 bg-red-500 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-red-600 transition-colors cursor-pointer text-center"
                    onClick={closeErrorPopup}
                  >
                    Try Again
                  </label>
                  <input
                    type="file"
                    id="resume-upload-retry"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}