'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, MessageCircle, Trophy, Send, User, BadgeDollarSign } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '../context/UserContext';

export default function SleepPage() {
  const router = useRouter();
  const { user, loading, petType, gameCurrency, darkMode } = useUser();
  const [petName, setPetName] = useState('Lumi');
  const [remainingSeconds, setRemainingSeconds] = useState(3 * 60 * 60);
  const isDark = darkMode || false;

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
    if (isDark) {
      if (petType === 'lumi') return 'from-gray-900 to-gray-800 text-white';
      if (petType === 'luna') return 'from-gray-900 to-gray-800 text-white';
      return 'from-gray-900 to-gray-800 text-white';
    }
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
      <div className={`font-sans max-w-md mx-auto h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? 'text-white' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !petType) {
    return null;
  }

  return (
    <div className={`font-sans max-w-md mx-auto h-screen shadow-2xl overflow-hidden relative ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
      <div className={`h-screen flex flex-col bg-gradient-to-b ${getThemeColors()} relative overflow-hidden`}>
        <div className="flex-1 relative overflow-hidden">
          <div className="flex flex-col h-full select-none">
            <div className={`px-6 py-4 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10 ${isDark ? 'bg-gray-900/50' : 'bg-white/50'}`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : (petType === 'lumi' ? 'text-cyan-800' : 'text-purple-800')}`}>
                {petName}
              </h2>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => router.push('/shop')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border cursor-pointer ${isDark ? 'bg-yellow-900/50 border-yellow-800 hover:bg-yellow-900/70' : 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200'}`}
                >
                  <BadgeDollarSign size={18} className={isDark ? 'text-yellow-300' : 'text-yellow-800'} />
                  <span className={`font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>{gameCurrency}</span>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className={`p-2 rounded-full border transition ${isDark ? 'border-gray-700 hover:bg-gray-800 text-white' : 'border-gray-200 hover:bg-gray-50'}`}
                  aria-label="Profile"
                >
                  <User size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-end relative px-4 pb-8 pointer-events-none">
              <div className={`absolute bottom-[280px] z-20 max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-lg border ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-100'}`}>
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

            <div className={`p-4 border-t pb-20 md:pb-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
              <div className={`flex gap-2 p-2 rounded-full border opacity-70 pointer-events-none ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <input
                  type="text"
                  disabled
                  placeholder="Lumi is sleeping..."
                  className={`flex-1 bg-transparent px-4 outline-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
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

        <div className={`border-t flex justify-around items-center p-4 pb-6 shadow-lg z-20 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <button
            onClick={() => router.push('/app?tab=dashboard')}
            className={`flex flex-col items-center gap-1 transition ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
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
            className={`flex flex-col items-center gap-1 transition ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            <Trophy size={24} strokeWidth={2} />
            <span className="text-[10px] font-bold">Friends</span>
          </button>
        </div>
      </div>
    </div>
  );
}
