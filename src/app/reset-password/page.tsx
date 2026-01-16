'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const allowedDomains = ['gmail.com', 'outlook.com', 'cust.pk', 'edu.cust.pk'];

  const validateEmail = (email: string) => {
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateEmail(email)) {
      setError('Only emails from gmail.com, outlook.com, cust.pk, or edu.cust.pk are allowed');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
      } else {
        setError(data.error || 'Email not found in our records.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?message=Password updated successfully');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Dark Background */}
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
                Password Recovery
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Reset Your
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Password
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-2xl">
                {step === 1 ? 'Enter your email to verify your account' : 'Create your new password'}
              </p>
            </div>

            {/* Right Side - Reset Form */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="w-full max-w-md">
                <div className="glass rounded-3xl p-8 shadow-2xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {step === 1 ? 'Verify Email' : 'New Password'}
                    </h2>
                    <p className="text-white/80">
                      {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-300/30 text-white rounded-2xl">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  {step === 1 ? (
                    // Step 1: Email verification
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="email" className="block text-white font-semibold mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                          placeholder="Enter your email address"
                          required
                        />
                        <p className="mt-2 text-white/60 text-sm">
                          Only emails from gmail.com, outlook.com, cust.pk, or edu.cust.pk are allowed
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full px-8 py-4 bg-white text-indigo-600 rounded-2xl text-lg font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="relative z-10">
                          {isLoading ? 'Verifying...' : 'Verify Email'}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                      </button>
                    </form>
                  ) : (
                    // Step 2: New password form
                    <div>
                      <div className="mb-6 p-4 bg-green-500/20 border border-green-300/30 text-white rounded-2xl">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Email verified: {email}
                        </div>
                      </div>

                      <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="newPassword" className="block text-white font-semibold mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                            placeholder="Enter new password"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 px-8 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all duration-300 hover:scale-105 glass"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex-1 px-8 py-4 bg-white text-indigo-600 rounded-2xl text-lg font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="relative z-10">
                              {isLoading ? 'Updating...' : 'Update Password'}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Links */}
                  <div className="mt-8 text-center space-y-4">
                    <div className="flex items-center justify-center space-x-6">
                      <Link 
                        href="/login" 
                        className="text-white/80 hover:text-white font-medium transition-colors"
                      >
                        Sign In
                      </Link>
                      <span className="text-white/40">•</span>
                      <Link 
                        href="/signup" 
                        className="text-white/80 hover:text-white font-medium transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Back to Dashboard */}
                <div className="text-center mt-6">
                  <Link 
                    href="/dashboard" 
                    className="text-white/80 hover:text-white font-medium transition-colors"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
