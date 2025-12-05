'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './context/UserContext';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, petType } = useUser();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
    } else if (!petType) {
      router.push('/onboarding');
    } else {
      router.push('/app');
    }
  }, [user, loading, petType, router]);

  return (
    <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
