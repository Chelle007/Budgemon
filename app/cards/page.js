'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CardManagementView from '../components/CardManagementView';
import { useUser } from '../context/UserContext';

export default function CardsPage() {
  const router = useRouter();
  const { user, loading, cards, handleAddCard, handleUpdateCard, handleDeleteCard } = useUser();

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
      <CardManagementView
        cards={cards}
        onClose={() => router.push('/app?tab=dashboard')}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
      />
    </div>
  );
}

