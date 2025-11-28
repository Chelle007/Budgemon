'use client';

import { BarChart2, MessageCircle, Trophy } from 'lucide-react';
import CompanionView from './CompanionView';
import ManagerView from './ManagerView';
import LeaderboardView from './LeaderboardView';
import ShopView from './ShopView';

export default function MainAppLayout({
  activeTab,
  setActiveTab,
  themeClasses,
  accentColorClass,
  petType,
  onOpenShop,
  messages,
  chatEndRef,
  inputText,
  setInputText,
  onSendMessage,
  gameCurrency,
  equipped,
  balance,
  transactions,
  friends,
  isShopOpen,
  onCloseShop,
  shopItems,
  inventory,
  onBuyItem,
  onEquipItem,
}) {
  return (
    <div className={`h-screen flex flex-col bg-gradient-to-b ${themeClasses} relative overflow-hidden`}>
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'companion' && (
          <CompanionView
            petType={petType}
            gameCurrency={gameCurrency}
            onOpenShop={onOpenShop}
            messages={messages}
            chatEndRef={chatEndRef}
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={onSendMessage}
            accentColorClass={accentColorClass}
            equipped={equipped}
          />
        )}
        {activeTab === 'dashboard' && <ManagerView balance={balance} transactions={transactions} />}
        {activeTab === 'social' && <LeaderboardView friends={friends} />}
      </div>

      <div className="bg-white border-t border-gray-200 flex justify-around items-center p-4 pb-6 shadow-lg z-20">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'dashboard' ? 'text-green-600' : 'text-gray-400'}`}
        >
          <BarChart2 size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Manager</span>
        </button>

        <button onClick={() => setActiveTab('companion')} className="relative -top-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transform transition active:scale-95 ${accentColorClass}`}>
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

      {isShopOpen && (
        <div className="absolute inset-0 z-30 bg-white">
          <ShopView
            onClose={onCloseShop}
            gameCurrency={gameCurrency}
            petType={petType}
            inventory={inventory}
            onBuyItem={onBuyItem}
            onEquipItem={onEquipItem}
            items={shopItems}
          />
        </div>
      )}
    </div>
  );
}

