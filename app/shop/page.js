'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShopView from '../components/ShopView';
import { useUser } from '../context/UserContext';

export default function ShopPage() {
  const router = useRouter();
  const { user, loading, petType, gameCurrency, inventory, shopItems, buyItem, handleEquipItem, equipped } = useUser();

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
      <ShopView
        onClose={() => router.push('/app')}
        gameCurrency={gameCurrency}
        petType={petType}
        inventory={inventory}
        onBuyItem={buyItem}
        onEquipItem={handleEquipItem}
        items={shopItems}
        equipped={equipped}
      />
    </div>
  );
}

