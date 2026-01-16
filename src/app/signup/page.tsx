'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const allowedDomains = ['gmail.com', 'outlook.com', 'cust.pk', 'edu.cust.pk','yahoo.com'];

  const validateEmail = (email: string) => {
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!validateEmail(formData.email)) {
      setErrors({ 
        email: 'Only institutional and verified email domains are allowed' 
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?message=Account created successfully! Please log in.');
      } else {
        setErrors({ general: data.error });
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
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
                Join Resumia Today
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Start Your
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Dream Career
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-2xl">
                Create your account and unlock the power of AI-driven resume building and job matching.
              </p>
            </div>

            {/* Right Side - Signup Form */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="w-full max-w-md">
                <div className="glass rounded-3xl p-8 shadow-2xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-white/80">Join thousands of professionals</p>
                  </div>

                  {/* Error Message */}
                  {errors.general && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-300/30 text-white rounded-2xl">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.general}
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-white font-semibold mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-white font-semibold mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                      {errors.email && (
                        <p className="mt-2 text-red-200 text-sm">{errors.email}</p>
                      )}
                      <p className="mt-2 text-white/60 text-sm">
                        Only institutional and verified email domains are allowed
                      </p>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-white font-semibold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>

                    {/* Submit Button - Same as Dashboard */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full px-8 py-4 bg-white text-indigo-600 rounded-2xl text-lg font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10">
                        {isLoading ? 'Creating Account...' : 'Start Building Free'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    </button>
                  </form>

                  {/* Sign In Link */}
                  <div className="mt-6 text-center">
                    <p className="text-white/80 mb-4">Already have an account?</p>
                    <Link 
                      href="/login" 
                      className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all duration-300 hover:scale-105 glass inline-block"
                    >
                      Sign In
                    </Link>
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

