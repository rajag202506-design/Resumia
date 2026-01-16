'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface FormData {
  email: string;
  password: string;
}

interface Errors {
  [key: string]: string;
}

export default function Login() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        router.push('/');
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
                Welcome Back to Resumia
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Sign Into Your
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Career Portal
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-2xl">
                Continue building your professional future with our AI-powered resume builder and job matching platform.
              </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="w-full max-w-md">
                <div className="glass rounded-3xl p-8 shadow-2xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                    <p className="text-white/80">Welcome back! Please sign in to your account</p>
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
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-white font-semibold mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <svg className="w-5 h-5 text-white/60 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-white/30 rounded bg-white/20"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-white font-medium">
                          Remember me
                        </label>
                      </div>

                      <Link 
                        href="/reset-password" 
                        className="text-white hover:text-white/80 font-semibold transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    {/* Submit Button - Same as Dashboard */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full px-8 py-4 bg-white text-indigo-600 rounded-2xl text-lg font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10">
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    </button>
                  </form>

                  {/* Sign Up Link - Same border style as Dashboard */}
                  <div className="mt-6 text-center">
                    <p className="text-white/80 mb-4">Don't have an account?</p>
                    <Link 
                      href="/signup" 
                      className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all duration-300 hover:scale-105 glass inline-block"
                    >
                      Create Account
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
