'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FRIENDS_LEADERBOARD, SHOP_ITEMS } from '../constants/mockData';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [petType, setPetType] = useState(null);
  const [balance, setBalance] = useState(0);
  const [gameCurrency, setGameCurrency] = useState(160);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadShopItems();
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setPetType(null);
        setBalance(0);
        setGameCurrency(160);
        setInventory([]);
        setEquipped({});
        setTransactions([]);
        setCards([]);
        setMessages([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      loadUserData(session.user.id);
    } else {
      setLoading(false);
    }
  };

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

  const autoSelectLumi = async (userId, existingGameCurrency = null) => {
    const initialMsg = { sender: 'bot', text: `Hi! I'm Lumi! Let's save money together! 😇` };
    const currencyToUse = existingGameCurrency !== null ? existingGameCurrency : (gameCurrency || 160);
    
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingProfile) {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email || '';
        const username = email ? email.split('@')[0] : `user_${userId.slice(0, 8)}`;
        
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            username: username,
            full_name: userData?.user?.user_metadata?.full_name || '',
          });
      }

      const { data: existingCompanion } = await supabase
        .from('companions')
        .select('game_currency')
        .eq('user_id', userId)
        .maybeSingle();

      const finalCurrency = existingCompanion?.game_currency ?? currencyToUse;

      await supabase
        .from('companions')
        .upsert({
          user_id: userId,
          pet_type: 'lumi',
          game_currency: finalCurrency,
        }, {
          onConflict: 'user_id'
        });

      setPetType('lumi');
      setGameCurrency(finalCurrency);

      const { data: existingMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (!existingMessages || existingMessages.length === 0) {
        await supabase
          .from('chat_messages')
          .insert({
            user_id: userId,
            sender: 'bot',
            text: initialMsg.text,
          });
      }

      loadChatMessages(userId);
    } catch (error) {
      console.error('Error auto-selecting Lumi:', error);
      setPetType('lumi');
      setMessages([initialMsg]);
      setGameCurrency(currencyToUse);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const { data: companion, error: companionError } = await supabase
        .from('companions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (companion && !companionError) {
        const existingCurrency = companion.game_currency || 0;
        setGameCurrency(existingCurrency);
        
        if (companion.pet_type) {
          setPetType(companion.pet_type);
          loadChatMessages(userId);
        } else {
          await autoSelectLumi(userId, existingCurrency);
        }
      } else {
        await autoSelectLumi(userId, null);
      }

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);

      if (transactionsData && !transactionsError) {
        setTransactions(transactionsData);
        const total = transactionsData.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        setBalance(total);
      }

      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cardsData && !cardsError) {
        const hasCashCard = cardsData.some(card => card.name === 'Cash');
        if (!hasCashCard) {
          const { data: cashCard } = await supabase
            .from('cards')
            .insert({
              user_id: userId,
              name: 'Cash',
              balance: 0,
              color: '#10B981',
            })
            .select()
            .single();
          
          if (cashCard) {
            setCards([cashCard, ...cardsData]);
          } else {
            setCards(cardsData);
          }
        } else {
          setCards(cardsData);
        }
      }

      const { data: inventoryData, error: inventoryError } = await supabase
        .from('user_inventory')
        .select('shop_item_id')
        .eq('user_id', userId);

      if (inventoryData && !inventoryError) {
        setInventory(inventoryData.map(item => item.shop_item_id));
      }

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
      if (petType) {
        const welcomeMsg = petType === 'lumi'
          ? { sender: 'bot', text: `Hi! I'm Lumi! Let's save money together! 😇` }
          : { sender: 'bot', text: `I'm Luna. Don't disappoint me with your spending. 😒` };
        setMessages([welcomeMsg]);
      }
    }
  };

  const selectPet = async (type) => {
    if (!user) return;

    setPetType(type);
    const initialMsg =
      type === 'lumi'
        ? { sender: 'bot', text: `Hi! I'm Lumi! Let's save money together! 😇` }
        : { sender: 'bot', text: `I'm Luna. Don't disappoint me with your spending. 😒` };
    setMessages([initialMsg]);

    try {
      await supabase
        .from('companions')
        .upsert({
          user_id: user.id,
          pet_type: type,
          game_currency: gameCurrency,
        }, {
          onConflict: 'user_id'
        });

      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          sender: 'bot',
          text: initialMsg.text,
        });

      router.push('/app');
    } catch (error) {
      console.error('Error saving pet selection:', error);
      router.push('/app');
    }
  };

  const handleSendMessage = async (text) => {
    if (!text?.trim() || !user) return;

    const content = text.trim();
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
      const amountMatch = content.match(/\$?\s*(\d+(\.\d+)?)/);
      const val = amountMatch ? parseFloat(amountMatch[1]) : 10;

      let title = 'New Expense';
      const beforeAmount = content.split('$')[0] || content;
      const cleanedTitle = beforeAmount
        .replace(/spent|bought|buy|on|for|i\'?m?|am/gi, ' ')
        .trim();

      if (cleanedTitle) {
        title = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
      }

      const newTransaction = {
        title,
        amount: -val,
        date: new Date().toISOString().split('T')[0],
        category: 'General',
        type: 'expense',
      };

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
  };

  const buyItem = async (item) => {
    if (!user) return;

    if (gameCurrency >= item.price) {
      const newCurrency = gameCurrency - item.price;
      setGameCurrency(newCurrency);
      setInventory((prev) => [...prev, item.id]);
      setEquipped((prev) => ({ ...prev, [item.category]: item.icon }));

      try {
        await supabase
          .from('companions')
          .update({ game_currency: newCurrency })
          .eq('user_id', user.id);

        await supabase
          .from('user_inventory')
          .insert({
            user_id: user.id,
            shop_item_id: item.id,
          });

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

  const handleAddCard = async (cardData) => {
    if (!user) return;

    try {
      // Check if a card with the same name already exists
      const cardName = cardData.name?.trim();
      if (!cardName) {
        alert('Please enter a card name.');
        return;
      }

      const existingCard = cards.find(card => card.name.toLowerCase() === cardName.toLowerCase());
      if (existingCard) {
        alert(`A card named "${existingCard.name}" already exists. Please use a different name.`);
        return;
      }

      // Convert empty strings to null for optional fields and use database column names
      const cleanedCardData = {
        name: cardName,
        card_number: cardData.cardNumber && cardData.cardNumber.trim() ? cardData.cardNumber.trim() : null,
        cardholder_name: cardData.cardholderName && cardData.cardholderName.trim() ? cardData.cardholderName.trim() : null,
        balance: cardData.balance || 0,
        color: cardData.color || '#3B82F6',
      };

      const { data, error } = await supabase
        .from('cards')
        .insert({
          user_id: user.id,
          ...cleanedCardData,
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
      // Show more specific error message
      const errorMessage = error?.message || error?.details || 'Unknown error occurred';
      alert(`Failed to add card: ${errorMessage}. Please try again.`);
    }
  };

  const handleUpdateCard = async (cardId, cardData) => {
    if (!user) return;

    try {
      // Convert empty strings to null for optional fields and use database column names
      const cleanedCardData = {
        name: cardData.name?.trim() || '',
        card_number: cardData.cardNumber && cardData.cardNumber.trim() ? cardData.cardNumber.trim() : null,
        cardholder_name: cardData.cardholderName && cardData.cardholderName.trim() ? cardData.cardholderName.trim() : null,
        balance: cardData.balance || 0,
        color: cardData.color || '#3B82F6',
      };

      const { data, error } = await supabase
        .from('cards')
        .update(cleanedCardData)
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
      // Show more specific error message
      const errorMessage = error?.message || error?.details || 'Unknown error occurred';
      alert(`Failed to update card: ${errorMessage}. Please try again.`);
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

    router.push('/app?tab=dashboard');
  };

  const handleEquipItem = async (item) => {
    if (!user) return;

    const equippedUpdate = {};
    
    if (item.icon === null) {
      setEquipped((prev) => {
        const newEquipped = { ...prev };
        delete newEquipped[item.category];
        return newEquipped;
      });
      
      if (item.category === 'head') equippedUpdate.head_item_id = null;
      else if (item.category === 'face') equippedUpdate.face_item_id = null;
      else if (item.category === 'eyes') equippedUpdate.eyes_item_id = null;
      else if (item.category === 'body') equippedUpdate.body_item_id = null;
      else if (item.category === 'hand') equippedUpdate.hand_item_id = null;
    } else {
      setEquipped((prev) => ({ ...prev, [item.category]: item.icon }));
      
      if (item.category === 'head') equippedUpdate.head_item_id = item.id;
      else if (item.category === 'face') equippedUpdate.face_item_id = item.id;
      else if (item.category === 'eyes') equippedUpdate.eyes_item_id = item.id;
      else if (item.category === 'body') equippedUpdate.body_item_id = item.id;
      else if (item.category === 'hand') equippedUpdate.hand_item_id = item.id;
    }

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
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setPetType(null);
      setBalance(0);
      setGameCurrency(160);
      setInventory([]);
      setEquipped({});
      setTransactions([]);
      setCards([]);
      setMessages([]);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    petType,
    balance,
    gameCurrency,
    inventory,
    equipped,
    transactions,
    cards,
    shopItems: shopItems.length > 0 ? shopItems : SHOP_ITEMS,
    messages,
    selectPet,
    handleSendMessage,
    buyItem,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleTransactionSubmit,
    handleEquipItem,
    handleLogout,
    loadUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

