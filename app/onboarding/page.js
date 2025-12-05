'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '../context/UserContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, petType, selectPet, darkMode } = useUser();
  const isDark = darkMode || false;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && petType) {
      router.push('/app');
    }
  }, [user, loading, petType, router]);

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

  if (!user) {
    return null;
  }

  return (
    <div className={`flex flex-col h-screen p-4 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${isDark ? 'bg-cyan-900/20' : 'bg-cyan-200/20'}`}></div>
      <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 ${isDark ? 'bg-purple-900/20' : 'bg-purple-200/20'}`}></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-center mt-6 mb-8">
          <h2 className={`text-3xl font-bold bg-clip-text text-transparent mb-2 ${isDark ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent' : 'bg-gradient-to-r from-cyan-600 to-purple-600'}`}>
            Choose your Companion
          </h2>
          <p className={isDark ? 'text-gray-300 text-base' : 'text-gray-600 text-base'}>This determines your coaching style</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pb-6">
          <div
            onClick={() => selectPet('lumi')}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer active:opacity-80 ${isDark ? 'border-cyan-600 bg-gradient-to-br from-cyan-900/30 to-blue-900/30' : 'border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50'}`}
          >
            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-36 h-36 mb-3">
                <Image
                  src="/lumi-large.png"
                  alt="Lumi"
                  width={144}
                  height={144}
                  className="object-contain w-full h-full"
                />
              </div>
              
              <div className="mb-2">
                <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>Lumi</h3>
                <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold ${isDark ? 'bg-gradient-to-r from-cyan-800 to-blue-800 text-cyan-200' : 'bg-gradient-to-r from-cyan-200 to-blue-200 text-cyan-800'}`}>
                  Supportive
                </span>
              </div>
              
              <p className={`text-xs leading-relaxed max-w-xs italic ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                "It's okay! I'm here with you. Let's celebrate your small wins!"
              </p>
            </div>
          </div>

          <div
            onClick={() => selectPet('luna')}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer active:opacity-80 ${isDark ? 'border-purple-600 bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30' : 'border-purple-300 bg-gradient-to-br from-purple-50 to-fuchsia-50'}`}
          >
            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-36 h-36 mb-3">
                <Image
                  src="/luna.png"
                  alt="Luna"
                  width={144}
                  height={144}
                  className="object-contain w-full h-full"
                />
              </div>
              
              <div className="mb-2">
                <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>Luna</h3>
                <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold ${isDark ? 'bg-gradient-to-r from-purple-800 to-fuchsia-800 text-purple-200' : 'bg-gradient-to-r from-purple-200 to-fuchsia-200 text-purple-800'}`}>
                  Asian Mom Mode
                </span>
              </div>
              
              <p className={`text-xs leading-relaxed max-w-xs italic ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                "$20 for Starbucks? NO WAY. You need better habits immediately."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
