'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomePageContent from './components/HomePage';

export default function MainPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Not logged in, redirect to dashboard (which is public)
      router.push('/dashboard');
    } else {
      // Logged in, show home page
      setIsLoggedIn(true);
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect to dashboard
  }

  return <HomePageContent />;
}


