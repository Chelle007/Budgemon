'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, MessageCircle, Trophy, Send, User, BadgeDollarSign } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '../context/UserContext';

export default function SleepPage() {
  const router = useRouter();
  const { user, loading, petType, gameCurrency } = useUser();
  const [petName, setPetName] = useState('Lumi');
  const [remainingSeconds, setRemainingSeconds] = useState(3 * 60 * 60);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !petType) {
      router.push('/onboarding');
    }
  }, [user, loading, petType, router]);

  useEffect(() => {
    setPetName(petType === 'lumi' ? 'Lumi' : 'Luna');
  }, [petType]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [remainingSeconds]);

  const formatTime = (totalSeconds) => {
    const clamped = Math.max(totalSeconds, 0);
    const hours = String(Math.floor(clamped / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((clamped % 3600) / 60)).padStart(2, '0');
    const seconds = String(clamped % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

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
          <div className="flex flex-col h-full select-none">
            <div className="px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <h2 className={`text-lg font-bold ${petType === 'lumi' ? 'text-cyan-800' : 'text-purple-800'}`}>
                {petName}
              </h2>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => router.push('/shop')}
                  className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200 cursor-pointer hover:bg-yellow-200"
                >
                  <BadgeDollarSign size={18} className="text-yellow-800" />
                  <span className="font-bold text-yellow-800">{gameCurrency}</span>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                  aria-label="Profile"
                >
                  <User size={20} className="text-gray-700" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-end relative px-4 pb-8 pointer-events-none">
              <div className="absolute bottom-[280px] z-20 max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-lg bg-white text-gray-800 border border-gray-100">
                {`Zzz... Come back in ${formatTime(remainingSeconds)}`}
              </div>

              <div className="relative w-64 h-64 flex items-center justify-center">
                <Image
                  src="/lumi-sleep-repeat.gif"
                  alt={`${petName} sleeping`}
                  width={256}
                  height={256}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 pb-20 md:pb-4">
              <div className="flex gap-2 bg-gray-50 p-2 rounded-full border border-gray-200 opacity-70 pointer-events-none">
                <input
                  type="text"
                  disabled
                  placeholder="Lumi is sleeping..."
                  className="flex-1 bg-transparent px-4 outline-none text-gray-400"
                />
                <button
                  disabled
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ${getAccentColor()} opacity-60`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
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
