'use client';

import React, { useEffect, useRef, useState } from 'react';
import LoginView from './components/LoginView';
import PetSelectionView from './components/PetSelectionView';
import MainAppLayout from './components/MainAppLayout';
import { FRIENDS_LEADERBOARD, SHOP_ITEMS, INITIAL_TRANSACTIONS } from './constants/mockData';

export default function Page({ sleepMode = false } = {}) {
  const [currentView, setCurrentView] = useState('login');
  const [activeTab, setActiveTab] = useState('companion');

  const [petType, setPetType] = useState(null);
  const [balance, setBalance] = useState(549.5);
  const [gameCurrency, setGameCurrency] = useState(160);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [cards, setCards] = useState([
    {
      id: 1,
      name: 'UOB',
      cardNumber: '4532123456789012',
      cardholderName: 'Chloe Lee',
      balance: 300.00,
      color: '#3B82F6',
    },
    {
      id: 2,
      name: 'DBS',
      cardNumber: '5555123456789012',
      cardholderName: 'Chloe Lee',
      balance: 249.50,
      color: '#8B5CF6',
    },
  ]);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const handleLogin = () => setCurrentView('onboarding');

  const selectPet = (type) => {
    setPetType(type);
    const initialMsg =
      type === 'lumi'
        ? { sender: 'bot', text: "Hi Chloe! I'm Lumi! Let's save money together! 😇" }
        : { sender: 'bot', text: "I'm Luna. Don't disappoint me with your spending. 😒" };
    setMessages([initialMsg]);
    setCurrentView('main');
  };

  const handleSendMessage = (overrideText) => {
    const content = (overrideText ?? inputText).trim();
    if (!content) return;

    setMessages((prev) => [...prev, { sender: 'user', text: content }]);

    let botResponse = '';
    const lowerInput = content.toLowerCase();

    if (lowerInput.includes('spent') || lowerInput.includes('bought') || lowerInput.includes('buy')) {
      const amount = lowerInput.match(/\d+/);
      const val = amount ? parseInt(amount[0]) : 10;

      setBalance((prev) => prev - val);
      setTransactions((prev) => [
        { id: Date.now(), title: 'New Expense', amount: -val, date: new Date().toISOString().split('T')[0], category: 'General' },
        ...prev,
      ]);

      botResponse =
        petType === 'lumi'
          ? `Okay! recorded $${val}. Remember, every penny counts! You're doing great! 🌟`
          : `$${val}?! Seriously? Do you think money grows on trees? 😤`;
    } else if (lowerInput.includes('save') || lowerInput.includes('salary')) {
      setGameCurrency((prev) => prev + 20);
      botResponse =
        petType === 'lumi'
          ? 'Yay! Saving is amazing! Here is 20 coins for being responsible! 🎉'
          : 'Finally, some sense. Keep that up and I might not scold you. +20 coins.';
    } else {
      botResponse =
        petType === 'lumi'
          ? "I'm here for you! Tell me about your spending or let's check your budget! 💕"
          : 'Make it quick. Are we saving or wasting money today? 💅';
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);

    if (!overrideText) {
      setInputText('');
    }
  };

  const buyItem = (item) => {
    if (gameCurrency >= item.price) {
      setGameCurrency((prev) => prev - item.price);
      setInventory((prev) => [...prev, item.id]);
      setEquipped((prev) => ({ ...prev, [item.category]: item.icon }));
    } else {
      alert('Not enough coins! Save more money to earn game currency!');
    }
  };

  const openAddTransaction = () => {
    setCurrentView('add-transaction');
    setActiveTab('dashboard');
  };

  const closeAddTransaction = () => {
    setCurrentView('main');
  };

  const openCardManagement = () => {
    setCurrentView('card-management');
    setActiveTab('dashboard');
  };

  const closeCardManagement = () => {
    setCurrentView('main');
  };

  const openProfile = () => {
    setCurrentView('profile');
  };

  const closeProfile = () => {
    setCurrentView('main');
  };

  const handleAddCard = (cardData) => {
    const newCard = {
      id: Date.now(),
      ...cardData,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const handleUpdateCard = (cardId, cardData) => {
    setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, ...cardData } : card)));
  };

  const handleDeleteCard = (cardId) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const handleTransactionSubmit = ({ title, amount, category, type, date, note, cardId }) => {
    const numericAmount = Number(amount);
    if (!title || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    const signedAmount = type === 'income' ? Math.abs(numericAmount) : -Math.abs(numericAmount);
    const newTransaction = {
      id: Date.now(),
      title,
      amount: signedAmount,
      category,
      date: date || new Date().toISOString().split('T')[0],
      note,
      cardId,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setBalance((prev) => prev + signedAmount);
    
    // Update card balance if cardId is provided
    if (cardId) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId
            ? { ...card, balance: (card.balance || 0) + signedAmount }
            : card
        )
      );
    }
    
    setCurrentView('main');
    setActiveTab('dashboard');
  };

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

  return (
    <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 shadow-2xl overflow-hidden relative">
      {currentView === 'login' && <LoginView onLogin={handleLogin} />}
      {currentView === 'onboarding' && <PetSelectionView onSelectPet={selectPet} />}
      {(currentView === 'main' || currentView === 'shop' || currentView === 'add-transaction' || currentView === 'card-management' || currentView === 'profile') && (
        <MainAppLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          themeClasses={getThemeColors()}
          accentColorClass={getAccentColor()}
          petType={petType}
          onOpenShop={() => setCurrentView('shop')}
          onOpenProfile={openProfile}
          messages={messages}
          chatEndRef={chatEndRef}
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
          gameCurrency={gameCurrency}
          equipped={equipped}
          balance={balance}
          transactions={transactions}
          friends={FRIENDS_LEADERBOARD}
          isShopOpen={currentView === 'shop'}
          onCloseShop={() => setCurrentView('main')}
          shopItems={SHOP_ITEMS}
          inventory={inventory}
          onBuyItem={buyItem}
          onEquipItem={(item) => {
            if (item.icon === null) {
              // Unequip: remove the property
              setEquipped((prev) => {
                const newEquipped = { ...prev };
                delete newEquipped[item.category];
                return newEquipped;
              });
            } else {
              // Equip: set the property
              setEquipped((prev) => ({ ...prev, [item.category]: item.icon }));
            }
          }}
          onAddTransaction={openAddTransaction}
          isTransactionFormOpen={currentView === 'add-transaction'}
          onCloseTransactionForm={closeAddTransaction}
          onSubmitTransaction={handleTransactionSubmit}
          onOpenCardManagement={openCardManagement}
          isCardManagementOpen={currentView === 'card-management'}
          onCloseCardManagement={closeCardManagement}
          cards={cards}
          onAddCard={handleAddCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          isProfileOpen={currentView === 'profile'}
          onCloseProfile={closeProfile}
          sleepMode={sleepMode}
        />
      )}
    </div>
  );
}

