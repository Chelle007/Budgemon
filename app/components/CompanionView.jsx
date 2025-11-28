'use client';

import { Send } from 'lucide-react';
import PetVisual from './PetVisual';

export default function CompanionView({
  petType,
  gameCurrency,
  onOpenShop,
  messages,
  chatEndRef,
  inputText,
  setInputText,
  onSendMessage,
  accentColorClass,
  equipped,
}) {
  const presetMessage = (text) => {
    onSendMessage(text);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${petType === 'lumi' ? 'bg-cyan-400' : 'bg-purple-500'} animate-pulse`}></div>
          <span className="font-bold text-gray-700 uppercase tracking-wider text-xs">AI Companion Active</span>
        </div>
        <div
          onClick={onOpenShop}
          className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200 cursor-pointer hover:bg-yellow-200"
        >
          <span>💰</span>
          <span className="font-bold text-yellow-800">{gameCurrency}</span>
        </div>
      </div>

      <div className="flex-shrink-0">
        <PetVisual petType={petType} equipped={equipped} />
        <div className="text-center mb-4">
          <h2 className={`text-2xl font-bold ${petType === 'lumi' ? 'text-cyan-800' : 'text-purple-800'}`}>
            {petType === 'lumi' ? 'Lumi' : 'Luna'}
          </h2>
          <p className="text-xs text-gray-500">Level 5 • Healthy</p>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => presetMessage('Bought Coffee $6')}
            className="flex-shrink-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm whitespace-nowrap active:scale-95 transition"
          >
            ☕ Coffee $6
          </button>
          <button
            onClick={() => presetMessage('Transport $2')}
            className="flex-shrink-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm whitespace-nowrap active:scale-95 transition"
          >
            🚆 Train $2
          </button>
          <button
            onClick={() => presetMessage('Lunch $12')}
            className="flex-shrink-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm whitespace-nowrap active:scale-95 transition"
          >
            🍜 Lunch $12
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gray-800 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 pb-20 md:pb-4">
        <div className="flex gap-2 bg-gray-50 p-2 rounded-full border border-gray-200">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Type 'Spent $12 on...'"
            className="flex-1 bg-transparent px-4 outline-none text-gray-700"
          />
          <button
            onClick={() => onSendMessage()}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition active:scale-90 ${accentColorClass}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

