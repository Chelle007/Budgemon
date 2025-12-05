'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart2, MessageCircle, Trophy, Plus } from 'lucide-react';
import CompanionView from '../components/CompanionView';
import CompanionSleepView from '../components/CompanionSleepView';
import ManagerView from '../components/ManagerView';
import LeaderboardView from '../components/LeaderboardView';
import { FRIENDS_LEADERBOARD } from '../constants/mockData';
import { useUser } from '../context/UserContext';

function AppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, petType, gameCurrency, equipped, balance, transactions, messages, handleSendMessage, handleTransactionSubmit } = useUser();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'companion');
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !petType) {
      router.push('/onboarding');
    }
  }, [user, loading, petType, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          {activeTab === 'companion' && (
            <CompanionView
              petType={petType}
              gameCurrency={gameCurrency}
              onOpenShop={() => router.push('/shop')}
              onOpenProfile={() => router.push('/profile')}
              messages={messages}
              chatEndRef={chatEndRef}
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={() => handleSendMessage(inputText)}
              accentColorClass={getAccentColor()}
              equipped={equipped}
            />
          )}
          {activeTab === 'dashboard' && (
            <ManagerView 
              user={user} 
              onAddTransaction={() => router.push('/transactions/add')} 
              onOpenCardManagement={() => router.push('/cards')} 
            />
          )}
          {activeTab === 'social' && <LeaderboardView friends={FRIENDS_LEADERBOARD} />}
        </div>

        {activeTab === 'dashboard' && (
          <button
            onClick={() => router.push('/transactions/add')}
            className="absolute bottom-28 right-4 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110 flex items-center justify-center z-30"
            aria-label="Add transaction"
          >
            <Plus size={24} />
          </button>
        )}

        <div className="bg-white border-t border-gray-200 flex justify-around items-center p-4 pb-6 shadow-lg z-20">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'dashboard' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <BarChart2 size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Manager</span>
          </button>

          <button onClick={() => setActiveTab('companion')} className="relative -top-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transform transition active:scale-95 ${getAccentColor()}`}>
              <MessageCircle size={32} fill="white" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'social' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <Trophy size={24} strokeWidth={activeTab === 'social' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Friends</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={
      <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AppContent />
    </Suspense>
  );
}

