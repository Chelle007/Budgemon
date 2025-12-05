'use client';

import React, { useEffect, useRef, useState } from 'react';
import LoginView from './components/LoginView';
import PetSelectionView from './components/PetSelectionView';
import MainAppLayout from './components/MainAppLayout';
import { FRIENDS_LEADERBOARD, SHOP_ITEMS, INITIAL_TRANSACTIONS } from './constants/mockData';
import { supabase } from '@/lib/supabase';

export default function Page({ sleepMode = false } = {}) {
  const [currentView, setCurrentView] = useState('login');
  const [activeTab, setActiveTab] = useState('companion');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [petType, setPetType] = useState(null);
  const [balance, setBalance] = useState(549.5);
  const [gameCurrency, setGameCurrency] = useState(160);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [shopItems, setShopItems] = useState([]);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Check authentication state on mount
  useEffect(() => {
    // Load shop items (available to everyone)
    loadShopItems();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setCurrentView('login');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load shop items from database
  const loadShopItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (data && !error) {
        setShopItems(data);
      }
    } catch (error) {
      console.error('Error loading shop items:', error);
    }
  };

  // Automatically set pet to lumi if not selected
  const autoSelectLumi = async (userId, existingGameCurrency = null) => {
    const initialMsg = { sender: 'bot', text: `Hi! I'm Lumi! Let's save money together! 😇` };
    const currencyToUse = existingGameCurrency !== null ? existingGameCurrency : (gameCurrency || 160);
    
    try {
      // Check if companion exists to preserve game_currency
      const { data: existingCompanion } = await supabase
        .from('companions')
        .select('game_currency')
        .eq('user_id', userId)
        .single();

      const finalCurrency = existingCompanion?.game_currency ?? currencyToUse;

      // Save pet selection to database
      const { error } = await supabase
        .from('companions')
        .upsert({
          user_id: userId,
          pet_type: 'lumi',
          game_currency: finalCurrency,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPetType('lumi');
      setGameCurrency(finalCurrency);

      // Check if welcome message already exists, if not, add it
      const { data: existingMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (!existingMessages || existingMessages.length === 0) {
        // Save initial message to database only if no messages exist
        await supabase
          .from('chat_messages')
          .insert({
            user_id: userId,
            sender: 'bot',
            text: initialMsg.text,
          });
      }

      // Load all messages including the welcome message
      loadChatMessages(userId);
      setCurrentView('main');
    } catch (error) {
      console.error('Error auto-selecting Lumi:', error);
      // Still proceed with UI update even if DB save fails
      setPetType('lumi');
      setMessages([initialMsg]);
      setCurrentView('main');
    }
  };

  // Load user data from Supabase
  const loadUserData = async (userId) => {
    try {
      // Load companion data
      const { data: companion, error: companionError } = await supabase
        .from('companions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (companion && !companionError) {
        const existingCurrency = companion.game_currency || 0;
        setGameCurrency(existingCurrency);
        
        // If pet is selected, go to main, otherwise auto-select lumi
        if (companion.pet_type) {
          setPetType(companion.pet_type);
          setCurrentView('main');
          loadChatMessages(userId);
        } else {
          // Auto-select lumi instead of showing onboarding
          await autoSelectLumi(userId, existingCurrency);
        }
      } else {
        // Auto-select lumi instead of showing onboarding
        await autoSelectLumi(userId, null);
      }

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);

      if (transactionsData && !transactionsError) {
        setTransactions(transactionsData);
        // Calculate balance from transactions
        const total = transactionsData.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        setBalance(total);
      }

      // Load cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cardsData && !cardsError) {
        setCards(cardsData);
      }

      // Load inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('user_inventory')
        .select('shop_item_id')
        .eq('user_id', userId);

      if (inventoryData && !inventoryError) {
        setInventory(inventoryData.map(item => item.shop_item_id));
      }

      // Load equipped items
      const { data: equippedData, error: equippedError } = await supabase
        .from('equipped_items')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (equippedData && !equippedError) {
        const equippedObj = {};
        if (equippedData.head_item_id) equippedObj.head = equippedData.head_item_id;
        if (equippedData.face_item_id) equippedObj.face = equippedData.face_item_id;
        if (equippedData.eyes_item_id) equippedObj.eyes = equippedData.eyes_item_id;
        if (equippedData.body_item_id) equippedObj.body = equippedData.body_item_id;
        if (equippedData.hand_item_id) equippedObj.hand = equippedData.hand_item_id;
        setEquipped(equippedObj);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  // Load chat messages
  const loadChatMessages = async (userId) => {
    const { data: messagesData, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (messagesData && !error) {
      setMessages(messagesData);
    } else {
      // Initialize with welcome message
      if (petType) {
        const welcomeMsg = petType === 'lumi'
          ? { sender: 'bot', text: `Hi! I'm Lumi! Let's save money together! 😇` }
          : { sender: 'bot', text: `I'm Luna. Don't disappoint me with your spending. 😒` };
        setMessages([welcomeMsg]);
      }
    }
  };

  const handleLogin = async () => {
    if (user) {
      if (petType) {
        setCurrentView('main');
      } else {
        // Auto-select lumi instead of showing onboarding
        await autoSelectLumi(user.id);
      }
    }
  };

  const handleSignupSuccess = async (userData) => {
    setUser(userData);
    // Automatically select lumi and go to main
    await autoSelectLumi(userData.id);
  };

  const selectPet = async (type) => {
    if (!user) return;

    setPetType(type);
    const initialMsg =
      type === 'lumi'
        ? { sender: 'bot', text: `Hi! I'm Lumi! Let's save money together! 😇` }
        : { sender: 'bot', text: `I'm Luna. Don't disappoint me with your spending. 😒` };
    setMessages([initialMsg]);

    // Save pet selection to database
    try {
      const { error } = await supabase
        .from('companions')
        .upsert({
          user_id: user.id,
          pet_type: type,
          game_currency: gameCurrency,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Save initial message to database
      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          sender: 'bot',
          text: initialMsg.text,
        });

      setCurrentView('main');
    } catch (error) {
      console.error('Error saving pet selection:', error);
      // Still proceed with UI update even if DB save fails
      setCurrentView('main');
    }
  };

  const handleSendMessage = async (overrideText) => {
    const content = (overrideText ?? inputText).trim();
    if (!content || !user) return;

    // Save user message to database
    const userMessage = { sender: 'user', text: content };
    setMessages((prev) => [...prev, userMessage]);

    try {
      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          sender: 'user',
          text: content,
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }

    let botResponse = '';
    const lowerInput = content.toLowerCase();

    if (lowerInput.includes('spent') || lowerInput.includes('bought') || lowerInput.includes('buy')) {
      // Extract amount (supports formats like "$6", "6", "6.50")
      const amountMatch = content.match(/\$?\s*(\d+(\.\d+)?)/);
      const val = amountMatch ? parseFloat(amountMatch[1]) : 10;

      // Derive a simple title from the text before the amount
      let title = 'New Expense';
      const beforeAmount = content.split('$')[0] || content;
      const cleanedTitle = beforeAmount
        .replace(/spent|bought|buy|on|for|i\'?m?|am/gi, ' ')
        .trim();

      if (cleanedTitle) {
        // Capitalise first letter, keep rest as‑is
        title = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
      }

      const newTransaction = {
        title,
        amount: -val,
        date: new Date().toISOString().split('T')[0],
        category: 'General',
        type: 'expense',
      };

      // Save transaction to database
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            ...newTransaction,
          })
          .select()
          .single();

        if (!error && data) {
          setTransactions((prev) => [data, ...prev]);
          setBalance((prev) => prev - val);
        }
      } catch (error) {
        console.error('Error saving transaction:', error);
      }

      botResponse =
        petType === 'lumi'
          ? `Okay! recorded $${val}. Remember, every penny counts! You're doing great! 🌟`
          : `$${val}?! Seriously? Do you think money grows on trees? 😤`;
    } else if (lowerInput.includes('save') || lowerInput.includes('salary')) {
      const newCurrency = gameCurrency + 20;
      setGameCurrency(newCurrency);

      // Update game currency in database
      try {
        await supabase
          .from('companions')
          .update({ game_currency: newCurrency })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating game currency:', error);
      }

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

    setTimeout(async () => {
      const botMessage = { sender: 'bot', text: botResponse };
      setMessages((prev) => [...prev, botMessage]);

      // Save bot message to database
      try {
        await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            sender: 'bot',
            text: botResponse,
          });
      } catch (error) {
        console.error('Error saving bot message:', error);
      }
    }, 1000);

    if (!overrideText) {
      setInputText('');
    }
  };

  const buyItem = async (item) => {
    if (!user) return;

    if (gameCurrency >= item.price) {
      const newCurrency = gameCurrency - item.price;
      setGameCurrency(newCurrency);
      setInventory((prev) => [...prev, item.id]);
      setEquipped((prev) => ({ ...prev, [item.category]: item.icon }));

      // Update database
      try {
        // Update game currency
        await supabase
          .from('companions')
          .update({ game_currency: newCurrency })
          .eq('user_id', user.id);

        // Add to inventory
        await supabase
          .from('user_inventory')
          .insert({
            user_id: user.id,
            shop_item_id: item.id,
          });

        // Update equipped items
        const equippedUpdate = {};
        if (item.category === 'head') equippedUpdate.head_item_id = item.id;
        else if (item.category === 'face') equippedUpdate.face_item_id = item.id;
        else if (item.category === 'eyes') equippedUpdate.eyes_item_id = item.id;
        else if (item.category === 'body') equippedUpdate.body_item_id = item.id;
        else if (item.category === 'hand') equippedUpdate.hand_item_id = item.id;

        await supabase
          .from('equipped_items')
          .upsert({
            user_id: user.id,
            ...equippedUpdate,
          }, {
            onConflict: 'user_id'
          });
      } catch (error) {
        console.error('Error updating shop purchase:', error);
      }
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Reset all state
      setUser(null);
      setPetType(null);
      setBalance(549.5);
      setGameCurrency(160);
      setInventory([]);
      setEquipped({});
      setTransactions([]);
      setCards([]);
      setMessages([]);
      setCurrentView('login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddCard = async (cardData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          user_id: user.id,
          ...cardData,
        })
        .select()
        .single();

      if (!error && data) {
        setCards((prev) => [...prev, data]);
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Failed to add card. Please try again.');
    }
  };

  const handleUpdateCard = async (cardId, cardData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cards')
        .update(cardData)
        .eq('id', cardId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (!error && data) {
        setCards((prev) => prev.map((card) => (card.id === cardId ? data : card)));
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error updating card:', error);
      alert('Failed to update card. Please try again.');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (!error) {
        setCards((prev) => prev.filter((card) => card.id !== cardId));
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  const handleTransactionSubmit = async ({ title, amount, category, type, date, note, cardId }) => {
    if (!user) return;

    const numericAmount = Number(amount);
    if (!title || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    const signedAmount = type === 'income' ? Math.abs(numericAmount) : -Math.abs(numericAmount);

    try {
      // Save transaction to database
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          title,
          amount: signedAmount,
          category,
          type,
          date: date || new Date().toISOString().split('T')[0],
          note,
          card_id: cardId,
        })
        .select()
        .single();

      if (!error && data) {
        setTransactions((prev) => [data, ...prev]);
        setBalance((prev) => prev + signedAmount);

        // Update card balance if cardId is provided
        if (cardId) {
          const card = cards.find(c => c.id === cardId);
          if (card) {
            const newBalance = (parseFloat(card.balance) || 0) + signedAmount;
            await supabase
              .from('cards')
              .update({ balance: newBalance })
              .eq('id', cardId)
              .eq('user_id', user.id);

            setCards((prev) =>
              prev.map((c) =>
                c.id === cardId ? { ...c, balance: newBalance } : c
              )
            );
          }
        }
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
      return;
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

  // Show loading state
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

  return (
    <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 shadow-2xl overflow-hidden relative">
      {currentView === 'login' && <LoginView onLogin={handleLogin} onSignupSuccess={handleSignupSuccess} />}
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
          shopItems={shopItems.length > 0 ? shopItems : SHOP_ITEMS}
          inventory={inventory}
          onBuyItem={buyItem}
          onEquipItem={async (item) => {
            if (!user) return;

            const equippedUpdate = {};
            
            if (item.icon === null) {
              // Unequip: remove the property
              setEquipped((prev) => {
                const newEquipped = { ...prev };
                delete newEquipped[item.category];
                return newEquipped;
              });
              
              // Set the category field to null in database
              if (item.category === 'head') equippedUpdate.head_item_id = null;
              else if (item.category === 'face') equippedUpdate.face_item_id = null;
              else if (item.category === 'eyes') equippedUpdate.eyes_item_id = null;
              else if (item.category === 'body') equippedUpdate.body_item_id = null;
              else if (item.category === 'hand') equippedUpdate.hand_item_id = null;
            } else {
              // Equip: set the property
              setEquipped((prev) => ({ ...prev, [item.category]: item.icon }));
              
              if (item.category === 'head') equippedUpdate.head_item_id = item.id;
              else if (item.category === 'face') equippedUpdate.face_item_id = item.id;
              else if (item.category === 'eyes') equippedUpdate.eyes_item_id = item.id;
              else if (item.category === 'body') equippedUpdate.body_item_id = item.id;
              else if (item.category === 'hand') equippedUpdate.hand_item_id = item.id;
            }

            // Update database
            try {
              await supabase
                .from('equipped_items')
                .upsert({
                  user_id: user.id,
                  ...equippedUpdate,
                }, {
                  onConflict: 'user_id'
                });
            } catch (error) {
              console.error('Error updating equipped items:', error);
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
          user={user}
          onLogout={handleLogout}
          sleepMode={sleepMode}
        />
      )}
    </div>
  );
}

