'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BadgeDollarSign } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function ShopPage() {
  const router = useRouter();
  const { user, loading, petType, gameCurrency, shopItems, inventory } = useUser();

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
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/app')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Pet Shop</h1>
          </div>
          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
            <BadgeDollarSign size={16} className="text-yellow-800" />
            <span className="font-bold text-yellow-800">{gameCurrency}</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden px-4 py-6 relative">
          {/* Original shop items with reduced opacity */}
          <div className="opacity-30 pointer-events-none">
            <div className="grid grid-cols-2 gap-4">
              {shopItems.map((item) => {
                const isOwned = inventory.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border-2 p-4 flex flex-col items-center gap-3 ${
                      isOwned ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-5xl">{item.icon}</div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{item.name}</h3>
                      <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold">
                        <BadgeDollarSign size={14} />
                        <span>{item.price}</span>
                      </div>
                    </div>
                    {isOwned && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">
                        Owned
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overlay "Stay Tuned!" message */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <BadgeDollarSign size={32} className="text-yellow-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Stay Tuned!</h2>
              <p className="text-gray-600 mb-4">The shop is currently under construction.</p>
              <p className="text-sm text-gray-500">We're working hard to bring you amazing items soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
