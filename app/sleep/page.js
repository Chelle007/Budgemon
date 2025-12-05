'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, MessageCircle, Trophy } from 'lucide-react';
import CompanionSleepView from '../components/CompanionSleepView';
import { useUser } from '../context/UserContext';

export default function SleepPage() {
  const router = useRouter();
  const { user, loading, petType, gameCurrency } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !petType) {
      router.push('/onboarding');
    }
  }, [user, loading, petType, router]);

  const getThemeColors = () => {
    if (petType === 'lumi') return 'from-blue-100 to-cyan-50 text-blue-800';
    if (petType === 'luna') return 'from-purple-100 to-fuchsia-50 text-purple-900';
    return 'from-gray-100 to-gray-50 text-gray-800';
  };

  const getAccentColor = () => {
    if (petType === 'lumi') return 'bg-cyan-500 hover:bg-cyan-600';
    if (petType === 'luna') return 'bg-purple-600 hover:bg-purple-700';
    return 'bg-green-500';
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

  if (!user || !petType) {
    return null;
  }

  return (
    <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 shadow-2xl overflow-hidden relative">
      <div className={`h-screen flex flex-col bg-gradient-to-b ${getThemeColors()} relative overflow-hidden`}>
        <div className="flex-1 relative overflow-hidden">
          <CompanionSleepView
            petType={petType}
            gameCurrency={gameCurrency}
            onOpenShop={() => router.push('/shop')}
            onOpenProfile={() => router.push('/profile')}
            accentColorClass={getAccentColor()}
          />
        </div>

        <div className="bg-white border-t border-gray-200 flex justify-around items-center p-4 pb-6 shadow-lg z-20">
          <button
            onClick={() => router.push('/app?tab=dashboard')}
            className="flex flex-col items-center gap-1 transition text-gray-400"
          >
            <BarChart2 size={24} strokeWidth={2} />
            <span className="text-[10px] font-bold">Manager</span>
          </button>

          <button onClick={() => router.push('/app?tab=companion')} className="relative -top-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transform transition active:scale-95 ${getAccentColor()}`}>
              <MessageCircle size={32} fill="white" />
            </div>
          </button>

          <button
            onClick={() => router.push('/app?tab=social')}
            className="flex flex-col items-center gap-1 transition text-gray-400"
          >
            <Trophy size={24} strokeWidth={2} />
            <span className="text-[10px] font-bold">Friends</span>
          </button>
        </div>
      </div>
    </div>
  );
}
