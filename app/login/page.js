'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginView from '../components/LoginView';
import { useUser } from '../context/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      router.push('/app');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    if (user) {
      router.push('/app');
    }
  };

  const handleSignupSuccess = async (userData) => {
    router.push('/app');
  };

  if (loading) {
    return (
      <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <LoginView onLogin={handleLogin} onSignupSuccess={handleSignupSuccess} />;
}

