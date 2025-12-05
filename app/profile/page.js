'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileView from '../components/ProfileView';
import { useUser } from '../context/UserContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, petType, balance, gameCurrency, cards, transactions, handleLogout } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 shadow-2xl overflow-hidden">
      <ProfileView
        onClose={() => router.push('/app')}
        user={user}
        onLogout={handleLogout}
        petType={petType}
        balance={balance}
        gameCurrency={gameCurrency}
        cards={cards}
        transactions={transactions}
      />
    </div>
  );
}

