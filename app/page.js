'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  BarChart2, 
  ShoppingBag, 
  Users, 
  Settings, 
  CreditCard, 
  ArrowLeft, 
  Send, 
  Plus, 
  Home, 
  Trophy,
  Activity,
  ShieldAlert,
  Menu
} from 'lucide-react';

// --- MOCK DATA ---

const FRIENDS_LEADERBOARD = [
  { id: 1, name: 'Desmond', balance: 1450, status: 'Stayed under daily budget 3 days in a row', rank: 1, avatar: '😎' },
  { id: 2, name: 'Michelle', balance: 1123, status: 'No overspending alerts for 5 days', rank: 2, avatar: '🌸' },
  { id: 3, name: 'Reynaldi', balance: 956, status: 'Avoided impulse purchases today', rank: 3, avatar: '🎨' },
  { id: 4, name: 'Chloe', balance: 549, status: 'Luna grew happier this week', rank: 4, isUser: true, avatar: '🐱' },
];

const SHOP_ITEMS = [
  { id: 1, name: 'Boba Tea', price: 6, icon: '🧋', category: 'hand' },
  { id: 2, name: 'Beige Hat', price: 12, icon: '🧢', category: 'head' },
  { id: 3, name: 'Sunglasses', price: 15, icon: '🕶️', category: 'eyes' },
  { id: 4, name: 'Magic Wand', price: 25, icon: '🪄', category: 'hand' },
  { id: 5, name: 'Bunny Ears', price: 18, icon: '🐰', category: 'head' },
  { id: 6, name: 'Cool Bag', price: 30, icon: '👜', category: 'body' },
];

const INITIAL_TRANSACTIONS = [
  { id: 1, title: 'H&M Dress', amount: -12.00, date: '2025-11-28', category: 'Shopping' },
  { id: 2, title: 'McDonalds', amount: -15.00, date: '2025-11-28', category: 'Food' },
  { id: 3, title: 'Salary', amount: 2300.00, date: '2025-11-12', category: 'Income' },
  { id: 4, title: 'Spotify', amount: -10.00, date: '2025-11-01', category: 'Subscription' },
];

// --- COMPONENTS ---

export default function Page() {
  // Navigation State
  const [currentView, setCurrentView] = useState('login'); // login, onboarding, main, manager, shop, leaderboard, settings
  const [activeTab, setActiveTab] = useState('companion'); // companion, dashboard, social
  
  // User State
  const [petType, setPetType] = useState(null); // 'lumi' (angel) or 'luna' (devil)
  const [balance, setBalance] = useState(549.50);
  const [gameCurrency, setGameCurrency] = useState(160); // Currency to buy items
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // --- LOGIC HANDLERS ---

  const handleLogin = () => {
    setCurrentView('onboarding');
  };

  const selectPet = (type) => {
    setPetType(type);
    const initialMsg = type === 'lumi' 
      ? { sender: 'bot', text: "Hi Chloe! I'm Lumi! Let's save money together! 😇" }
      : { sender: 'bot', text: "I'm Luna. Don't disappoint me with your spending. 😒" };
    setMessages([initialMsg]);
    setCurrentView('main');
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = { sender: 'user', text: inputText };
    setMessages([...messages, newMsg]);
    
    // Simple AI Logic based on keywords
    let botResponse = "";
    const lowerInput = inputText.toLowerCase();

    if (lowerInput.includes('spent') || lowerInput.includes('bought') || lowerInput.includes('buy')) {
      const amount = lowerInput.match(/\d+/);
      const val = amount ? parseInt(amount[0]) : 10;
      
      // Update balance logic (simulation)
      setBalance(prev => prev - val);
      setTransactions([
        { id: Date.now(), title: 'New Expense', amount: -val, date: new Date().toISOString().split('T')[0], category: 'General' },
        ...transactions
      ]);

      if (petType === 'lumi') {
        botResponse = `Okay! recorded $${val}. Remember, every penny counts! You're doing great! 🌟`;
      } else {
        botResponse = `$${val}?! Seriously? Do you think money grows on trees? 😤`;
      }
    } else if (lowerInput.includes('save') || lowerInput.includes('salary')) {
       setGameCurrency(prev => prev + 20); // Reward for saving talk
       if (petType === 'lumi') {
        botResponse = "Yay! Saving is amazing! Here is 20 coins for being responsible! 🎉";
      } else {
        botResponse = "Finally, some sense. Keep that up and I might not scold you. +20 coins.";
      }
    } else {
      if (petType === 'lumi') {
        botResponse = "I'm here for you! Tell me about your spending or let's check your budget! 💕";
      } else {
        botResponse = "Make it quick. Are we saving or wasting money today? 💅";
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);

    setInputText('');
  };

  const buyItem = (item) => {
    if (gameCurrency >= item.price) {
      setGameCurrency(prev => prev - item.price);
      setInventory([...inventory, item.id]);
      setEquipped({ ...equipped, [item.category]: item.icon });
    } else {
      alert("Not enough coins! Save more money to earn game currency!");
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- RENDER HELPERS ---

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

  // --- VIEWS ---

  const LoginView = () => (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-green-100 p-8 justify-center items-center">
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl text-6xl border-4 border-green-200">
        🐾
      </div>
      <h1 className="text-3xl font-bold text-green-800 mb-2">BudgeMon</h1>
      <p className="text-green-600 mb-8">Your AI Financial Companion</p>
      
      <div className="w-full max-w-xs space-y-4">
        <input type="email" value="haeeunlee2005@gmail.com" readOnly className="w-full p-4 rounded-xl border border-green-200 bg-white/80 text-gray-700" />
        <input type="password" value="******" readOnly className="w-full p-4 rounded-xl border border-green-200 bg-white/80 text-gray-700" />
        <button onClick={handleLogin} className="w-full bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-600 transition transform active:scale-95">
          Log In
        </button>
        <div className="flex justify-between text-sm text-green-700 mt-4">
          <span>Forgot Password?</span>
          <span className="font-bold">Sign Up!</span>
        </div>
      </div>
    </div>
  );

  const PetSelectionView = () => (
    <div className="flex flex-col h-screen bg-white p-6">
       <h2 className="text-2xl font-bold text-center mt-8 mb-2">Choose your Companion</h2>
       <p className="text-center text-gray-500 mb-8">This determines your coaching style.</p>

       <div className="flex-1 space-y-6 overflow-y-auto">
         {/* Lumi Option */}
         <div 
            onClick={() => selectPet('lumi')}
            className="p-6 rounded-3xl border-2 border-cyan-100 bg-cyan-50 hover:border-cyan-400 transition cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-cyan-200 rounded-full flex items-center justify-center text-3xl shadow-inner">😇</div>
              <div>
                <h3 className="text-xl font-bold text-cyan-800">Lumi</h3>
                <span className="text-xs bg-cyan-200 text-cyan-800 px-2 py-1 rounded-full">Supportive</span>
              </div>
            </div>
            <p className="text-cyan-700 text-sm">"It's okay! I'm here with you. Let's celebrate your small wins!"</p>
         </div>

         {/* Luna Option */}
         <div 
            onClick={() => selectPet('luna')}
            className="p-6 rounded-3xl border-2 border-purple-100 bg-purple-50 hover:border-purple-400 transition cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center text-3xl shadow-inner">😈</div>
              <div>
                <h3 className="text-xl font-bold text-purple-800">Luna</h3>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Asian Mom Mode</span>
              </div>
            </div>
            <p className="text-purple-700 text-sm">"$20 for Starbucks? NO WAY. You need better habits immediately."</p>
         </div>
       </div>
    </div>
  );

  const PetVisual = () => (
    <div className="relative w-48 h-48 mx-auto my-6 transition-all duration-500">
       {/* Base Pet */}
       <div className={`w-full h-full rounded-full flex items-center justify-center text-[8rem] shadow-2xl transition-colors duration-500 ${
         petType === 'lumi' 
          ? 'bg-gradient-to-tr from-cyan-200 to-blue-100 border-4 border-white ring-4 ring-cyan-100' 
          : 'bg-gradient-to-tr from-purple-300 to-fuchsia-100 border-4 border-white ring-4 ring-purple-100'
       }`}>
          <span className="animate-bounce-slow">
             {petType === 'lumi' ? '😺' : '😾'}
          </span>
       </div>

       {/* Equipped Items (Overlay) */}
       {equipped.head && <div className="absolute top-0 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg">{equipped.head}</div>}
       {equipped.eyes && <div className="absolute top-14 left-1/2 -translate-x-1/2 text-4xl drop-shadow-md z-10">{equipped.eyes}</div>}
       {equipped.hand && <div className="absolute bottom-4 right-0 text-5xl drop-shadow-lg rotate-12">{equipped.hand}</div>}
       {equipped.body && <div className="absolute bottom-0 left-0 text-4xl drop-shadow-lg">{equipped.body}</div>}
    </div>
  );

  const CompanionView = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <div className={`w-3 h-3 rounded-full ${petType === 'lumi' ? 'bg-cyan-400' : 'bg-purple-500'} animate-pulse`}></div>
           <span className="font-bold text-gray-700 uppercase tracking-wider text-xs">AI Companion Active</span>
        </div>
        <div 
          onClick={() => setCurrentView('shop')}
          className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200 cursor-pointer hover:bg-yellow-200"
        >
          <span>💰</span>
          <span className="font-bold text-yellow-800">{gameCurrency}</span>
        </div>
      </div>

      {/* Pet Display */}
      <div className="flex-shrink-0">
         <PetVisual />
         <div className="text-center mb-4">
            <h2 className={`text-2xl font-bold ${petType === 'lumi' ? 'text-cyan-800' : 'text-purple-800'}`}>
              {petType === 'lumi' ? 'Lumi' : 'Luna'}
            </h2>
            <p className="text-xs text-gray-500">Level 5 • Healthy</p>
         </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => {setInputText('Bought Coffee $6'); handleSendMessage()}} className="flex-shrink-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm whitespace-nowrap active:scale-95 transition">☕ Coffee $6</button>
          <button onClick={() => {setInputText('Transport $2'); handleSendMessage()}} className="flex-shrink-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm whitespace-nowrap active:scale-95 transition">🚆 Train $2</button>
          <button onClick={() => {setInputText('Lunch $12'); handleSendMessage()}} className="flex-shrink-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm whitespace-nowrap active:scale-95 transition">🍜 Lunch $12</button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-gray-800 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 pb-20 md:pb-4">
        <div className="flex gap-2 bg-gray-50 p-2 rounded-full border border-gray-200">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type 'Spent $12 on...'"
            className="flex-1 bg-transparent px-4 outline-none text-gray-700"
          />
          <button 
            onClick={handleSendMessage}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition active:scale-90 ${getAccentColor()}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const ManagerView = () => (
    <div className="flex flex-col h-full bg-gray-50 px-4 pt-6 pb-24 overflow-y-auto">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 rounded-3xl shadow-lg mb-6">
        <p className="text-gray-300 text-sm mb-1">Total Balance</p>
        <h1 className="text-4xl font-bold">${balance.toFixed(2)}</h1>
        <div className="mt-4 flex items-center gap-2 text-red-300 text-sm">
           <Activity size={16} />
           <span>You spent +49% vs last month</span>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-bold text-gray-800">November Analysis</h3>
           <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Weekly</span>
        </div>
        
        {/* Simple Bar Chart Visualization */}
        <div className="flex items-end justify-between h-32 gap-2 mb-2">
           <div className="w-full bg-red-100 rounded-t-lg relative group h-[42%]"><div className="absolute bottom-0 w-full bg-red-400 rounded-t-lg h-full transition-all group-hover:bg-red-500"></div></div>
           <div className="w-full bg-blue-100 rounded-t-lg relative group h-[30%]"><div className="absolute bottom-0 w-full bg-blue-400 rounded-t-lg h-full transition-all group-hover:bg-blue-500"></div></div>
           <div className="w-full bg-green-100 rounded-t-lg relative group h-[18%]"><div className="absolute bottom-0 w-full bg-green-400 rounded-t-lg h-full transition-all group-hover:bg-green-500"></div></div>
           <div className="w-full bg-yellow-100 rounded-t-lg relative group h-[10%]"><div className="absolute bottom-0 w-full bg-yellow-400 rounded-t-lg h-full transition-all group-hover:bg-yellow-500"></div></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Food</span><span>Leisure</span><span>Travel</span><span>Subs</span>
        </div>
      </div>

      {/* Calendar Lite */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Spending Calendar</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-600">
          <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
          {/* Mock Calendar Days */}
          {[...Array(30)].map((_, i) => {
             const day = i + 1;
             const isBad = [13, 25, 5].includes(day);
             const isGood = [12, 8].includes(day);
             return (
               <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-lg ${isBad ? 'bg-red-50 text-red-500' : isGood ? 'bg-green-50 text-green-600' : 'bg-transparent'}`}>
                 {day}
                 {isBad && <div className="w-1 h-1 bg-red-400 rounded-full mt-1"></div>}
                 {isGood && <div className="w-1 h-1 bg-green-400 rounded-full mt-1"></div>}
               </div>
             )
          })}
        </div>
      </div>

       {/* Transactions List */}
       <div className="mb-4">
         <h3 className="font-bold text-gray-800 mb-4 px-2">Recent Activity</h3>
         <div className="space-y-3">
           {transactions.map(t => (
             <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.amount > 0 ? <Plus size={16}/> : <ShoppingBag size={16}/>}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.category}</p>
                  </div>
                </div>
                <span className={`font-bold ${t.amount > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)}
                </span>
             </div>
           ))}
         </div>
       </div>
    </div>
  );

  const ShopView = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentView('main')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
          <span className="font-bold text-lg">Pet Shop</span>
          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
             <span>💰</span><span className="font-bold text-yellow-800">{gameCurrency}</span>
          </div>
        </div>
        
        {/* Preview */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
           <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm border">
             {petType === 'lumi' ? '😺' : '😾'}
           </div>
           <div>
             <p className="text-sm font-bold text-gray-700">Equip Items</p>
             <p className="text-xs text-gray-500">Tap items below to buy & wear!</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {SHOP_ITEMS.map(item => {
            const isOwned = inventory.includes(item.id);
            return (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition">
                <div className="text-5xl mb-2">{item.icon}</div>
                <h4 className="font-bold text-gray-800">{item.name}</h4>
                {isOwned ? (
                  <button 
                    onClick={() => setEquipped({...equipped, [item.category]: item.icon})}
                    className="w-full py-2 bg-gray-200 text-gray-600 rounded-xl text-sm font-bold"
                  >
                    Equip
                  </button>
                ) : (
                  <button 
                    onClick={() => buyItem(item)}
                    className="w-full py-2 bg-green-500 text-white rounded-xl text-sm font-bold shadow-green-200 hover:bg-green-600"
                  >
                    Buy ${item.price}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );

  const LeaderboardView = () => (
    <div className="flex flex-col h-full bg-white px-4 pt-8 pb-24 overflow-y-auto">
      <h2 className="text-center font-bold text-2xl mb-8">Leaderboard</h2>
      
      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-10">
        <div className="flex flex-col items-center">
           <div className="w-16 h-16 bg-gray-100 rounded-full border-2 border-gray-300 flex items-center justify-center text-3xl mb-2 relative">
             🌸
             <div className="absolute -bottom-3 bg-gray-300 text-white text-xs px-2 py-0.5 rounded-full">2nd</div>
           </div>
           <p className="font-bold text-sm">Michelle</p>
           <p className="text-xs text-gray-500">$1,123</p>
        </div>
        <div className="flex flex-col items-center relative -top-4">
           <div className="text-3xl absolute -top-10 text-yellow-500">👑</div>
           <div className="w-20 h-20 bg-yellow-50 rounded-full border-2 border-yellow-400 flex items-center justify-center text-4xl mb-2 relative shadow-lg">
             😎
             <div className="absolute -bottom-3 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">1st</div>
           </div>
           <p className="font-bold text-base">Desmond</p>
           <p className="text-xs text-yellow-600 font-bold">$1,450</p>
        </div>
        <div className="flex flex-col items-center">
           <div className="w-16 h-16 bg-orange-50 rounded-full border-2 border-orange-200 flex items-center justify-center text-3xl mb-2 relative">
             🎨
             <div className="absolute -bottom-3 bg-orange-300 text-white text-xs px-2 py-0.5 rounded-full">3rd</div>
           </div>
           <p className="font-bold text-sm">Reynaldi</p>
           <p className="text-xs text-gray-500">$956</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {FRIENDS_LEADERBOARD.map((friend) => (
          <div key={friend.id} className={`p-4 rounded-2xl flex items-center gap-4 ${friend.isUser ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <div className="font-bold text-gray-400 w-4 text-center">{friend.rank}</div>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-100">
              {friend.avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{friend.name} {friend.isUser && '(You)'}</h4>
              <p className="text-xs text-gray-500 leading-tight">{friend.status}</p>
            </div>
            <div className="font-bold text-green-600">${friend.balance}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition">
        + Add More Friends
      </div>
    </div>
  );

  const MainAppLayout = () => (
    <div className={`h-screen flex flex-col bg-gradient-to-b ${getThemeColors()} relative overflow-hidden`}>
      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'companion' && <CompanionView />}
        {activeTab === 'dashboard' && <ManagerView />}
        {activeTab === 'social' && <LeaderboardView />}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 flex justify-around items-center p-4 pb-6 shadow-lg z-20">
         <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'dashboard' ? 'text-green-600' : 'text-gray-400'}`}
         >
           <BarChart2 size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
           <span className="text-[10px] font-bold">Manager</span>
         </button>
         
         <button 
            onClick={() => setActiveTab('companion')}
            className="relative -top-6"
         >
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

      {/* Conditional Overlays */}
      {currentView === 'shop' && (
        <div className="absolute inset-0 z-30 bg-white">
          <ShopView />
        </div>
      )}
    </div>
  );

  return (
    <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 shadow-2xl overflow-hidden relative">
       {currentView === 'login' && <LoginView />}
       {currentView === 'onboarding' && <PetSelectionView />}
       {(currentView === 'main' || currentView === 'shop') && <MainAppLayout />}
    </div>
  );
}