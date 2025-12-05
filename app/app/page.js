'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart2, MessageCircle, Trophy, Plus, Send, User, BadgeDollarSign, Activity, ShoppingBag, CreditCard, Crown, Medal } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { FRIENDS_LEADERBOARD } from '../constants/mockData';
import { useUser } from '../context/UserContext';

function AppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, petType, gameCurrency, equipped, balance, transactions, messages, handleSendMessage, cards } = useUser();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'companion');
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);
  
  // CompanionView state
  const [speechBubble, setSpeechBubble] = useState({ text: '', visible: false, opacity: 0 });
  const [isTalking, setIsTalking] = useState(false);
  const speechTimeoutRef = useRef(null);
  const fadeTimeoutRef = useRef(null);
  const talkingTimeoutRef = useRef(null);
  const bubbleShowTimeoutRef = useRef(null);
  const previousMessagesLengthRef = useRef(messages.length);
  const awaitingBotResponseRef = useRef(false);
  
  // ManagerView state
  const [managerTransactions, setManagerTransactions] = useState([]);
  const [managerBalance, setManagerBalance] = useState(0);
  const [managerLoading, setManagerLoading] = useState(true);
  const [spendingBreakdown, setSpendingBreakdown] = useState({});
  const [monthComparison, setMonthComparison] = useState(null);
  const [calendarData, setCalendarData] = useState({});

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

  // CompanionView: Watch for new bot messages
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    
    // Track when user sends a message (we're awaiting bot response)
    if (lastMessage && lastMessage.sender === 'user' && messages.length > previousMessagesLengthRef.current) {
      awaitingBotResponseRef.current = true;
    }
    
    // Trigger animation only for bot responses to messages sent in this session
    if (lastMessage && 
        lastMessage.sender === 'bot' && 
        awaitingBotResponseRef.current) {
      
      awaitingBotResponseRef.current = false;
      
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (talkingTimeoutRef.current) clearTimeout(talkingTimeoutRef.current);
      if (bubbleShowTimeoutRef.current) clearTimeout(bubbleShowTimeoutRef.current);

      setIsTalking(true);
      setSpeechBubble({ text: lastMessage.text, visible: true, opacity: 0 });

      bubbleShowTimeoutRef.current = setTimeout(() => {
        setSpeechBubble((prev) => ({ ...prev, opacity: 1 }));
      }, 2000);

      talkingTimeoutRef.current = setTimeout(() => {
        setIsTalking(false);
      }, 5000);

      speechTimeoutRef.current = setTimeout(() => {
        setSpeechBubble((prev) => ({ ...prev, opacity: 0 }));
        fadeTimeoutRef.current = setTimeout(() => {
          setSpeechBubble({ text: '', visible: false, opacity: 0 });
        }, 500);
      }, 6500);
    }
    
    // Always update ref to track message count
    previousMessagesLengthRef.current = messages.length;

    return () => {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (talkingTimeoutRef.current) clearTimeout(talkingTimeoutRef.current);
      if (bubbleShowTimeoutRef.current) clearTimeout(bubbleShowTimeoutRef.current);
    };
  }, [messages]);

  // ManagerView: Load data
  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      // Immediately update balance from cards when dashboard becomes active
      const totalCardBalance = cards.reduce((sum, card) => {
        const cardBalance = parseFloat(card.balance) || 0;
        return sum + (isNaN(cardBalance) ? 0 : cardBalance);
      }, 0);
      setManagerBalance(totalCardBalance);
      
      loadManagerData();

      const channel = supabase
        .channel('transactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadManagerData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeTab, cards]);

  // Update manager balance and transactions when UserContext cards or transactions change
  // This runs whenever cards change, ensuring balance is always up-to-date
  useEffect(() => {
    // Always calculate total balance from all cards (like cards page)
    // This ensures we always show the sum of card balances, not transaction-based balance
    const totalCardBalance = cards.reduce((sum, card) => {
      const cardBalance = parseFloat(card.balance) || 0;
      return sum + (isNaN(cardBalance) ? 0 : cardBalance);
    }, 0);
    
    // Only update if we're on dashboard tab
    if (activeTab === 'dashboard') {
      setManagerBalance(totalCardBalance);
      
      // Also update managerTransactions to keep them in sync for immediate updates
      if (transactions.length > 0) {
        setManagerTransactions(transactions);
      }
    }
  }, [cards, transactions, activeTab]);

  // Also recalculate spending breakdown and calendar when transactions change
  // This ensures calendar is always synced with database transactions
  useEffect(() => {
    if (activeTab === 'dashboard' && transactions && transactions.length >= 0) {
      // Use transactions from UserContext (which are synced with database)
      // Recalculate spending breakdown and calendar data from current transactions
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Filter for current month transactions (expenses only for breakdown)
      const currentMonthExpenses = transactions.filter((t) => {
        if (!t.date) return false;
        try {
          const tDate = new Date(t.date);
          if (isNaN(tDate.getTime())) return false;
          return (
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear &&
            parseFloat(t.amount) < 0
          );
        } catch (e) {
          return false;
        }
      });

      // Filter for current month transactions (both expenses and income for calendar)
      const currentMonthTransactions = transactions.filter((t) => {
        if (!t.date) return false;
        try {
          const tDate = new Date(t.date);
          if (isNaN(tDate.getTime())) return false;
          return (
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear
          );
        } catch (e) {
          return false;
        }
      });

      // Calculate spending breakdown (expenses only)
      const breakdown = {};
      let totalExpenses = 0;

      currentMonthExpenses.forEach((t) => {
        const category = t.category || 'Other';
        const amount = Math.abs(parseFloat(t.amount || 0));
        if (!isNaN(amount)) {
          breakdown[category] = (breakdown[category] || 0) + amount;
          totalExpenses += amount;
        }
      });

      const breakdownPercentages = {};
      Object.keys(breakdown).forEach((category) => {
        breakdownPercentages[category] = totalExpenses > 0 ? (breakdown[category] / totalExpenses) * 100 : 0;
      });

      setSpendingBreakdown(breakdownPercentages);

      // Update calendar data (both expenses and income)
      const calendar = {};
      currentMonthTransactions.forEach((t) => {
        try {
          const tDate = new Date(t.date);
          if (!isNaN(tDate.getTime())) {
            const day = tDate.getDate();
            if (!calendar[day]) {
              calendar[day] = { total: 0, expenses: 0, income: 0, count: 0 };
            }
            const amount = parseFloat(t.amount || 0);
            if (!isNaN(amount)) {
              if (amount < 0) {
                // Expense
                calendar[day].expenses += Math.abs(amount);
                calendar[day].total += Math.abs(amount);
              } else {
                // Income
                calendar[day].income += amount;
              }
              calendar[day].count += 1;
            }
          }
        } catch (e) {
          // Skip invalid dates
        }
      });

      // Calculate average spending for status determination (expenses only)
      const daysWithExpenses = Object.keys(calendar).filter(day => calendar[day].expenses > 0).length;
      const avgSpending = daysWithExpenses > 0 ? totalExpenses / daysWithExpenses : 0;
      const calendarWithStatus = {};
      Object.keys(calendar).forEach((day) => {
        const dayData = calendar[day];
        calendarWithStatus[day] = {
          ...dayData,
          isBad: avgSpending > 0 && dayData.expenses > avgSpending * 1.5,
          isGood: dayData.expenses === 0 || (avgSpending > 0 && dayData.expenses < avgSpending * 0.5),
        };
      });

      setCalendarData(calendarWithStatus);
    }
  }, [transactions, activeTab]);

  const loadManagerData = async () => {
    if (!user || !user.id) {
      setManagerLoading(false);
      return;
    }

    try {
      setManagerLoading(true);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      const safeTransactionsData = transactionsData || [];
      setManagerTransactions(safeTransactionsData);
      
      // Also update transactions in UserContext if they're out of sync
      // This ensures the calendar gets the latest data from database

      const currentMonthTransactions = safeTransactionsData.filter((t) => {
        if (!t.date) return false;
        try {
          const tDate = new Date(t.date);
          if (isNaN(tDate.getTime())) return false;
          return (
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear &&
            parseFloat(t.amount) < 0
          );
        } catch (e) {
          return false;
        }
      });

      const breakdown = {};
      let totalExpenses = 0;

      currentMonthTransactions.forEach((t) => {
        const category = t.category || 'Other';
        const amount = Math.abs(parseFloat(t.amount || 0));
        if (!isNaN(amount)) {
          breakdown[category] = (breakdown[category] || 0) + amount;
          totalExpenses += amount;
        }
      });

      const breakdownPercentages = {};
      Object.keys(breakdown).forEach((category) => {
        breakdownPercentages[category] = totalExpenses > 0 ? (breakdown[category] / totalExpenses) * 100 : 0;
      });

      setSpendingBreakdown(breakdownPercentages);

      const lastMonthTransactions = safeTransactionsData.filter((t) => {
        if (!t.date) return false;
        try {
          const tDate = new Date(t.date);
          if (isNaN(tDate.getTime())) return false;
          return (
            tDate.getMonth() === lastMonth &&
            tDate.getFullYear() === lastMonthYear &&
            parseFloat(t.amount) < 0
          );
        } catch (e) {
          return false;
        }
      });

      const currentMonthTotal = currentMonthTransactions.reduce(
        (sum, t) => {
          const amount = Math.abs(parseFloat(t.amount || 0));
          return sum + (isNaN(amount) ? 0 : amount);
        },
        0
      );
      const lastMonthTotal = lastMonthTransactions.reduce(
        (sum, t) => {
          const amount = Math.abs(parseFloat(t.amount || 0));
          return sum + (isNaN(amount) ? 0 : amount);
        },
        0
      );

      if (lastMonthTotal > 0) {
        const change = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
        setMonthComparison(change);
      } else {
        setMonthComparison(null);
      }

      // Calculate calendar data for current month (both expenses and income)
      const allCurrentMonthTransactions = safeTransactionsData.filter((t) => {
        if (!t.date) return false;
        try {
          const tDate = new Date(t.date);
          if (isNaN(tDate.getTime())) return false;
          return (
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear
          );
        } catch (e) {
          return false;
        }
      });

      const calendar = {};
      allCurrentMonthTransactions.forEach((t) => {
        try {
          const tDate = new Date(t.date);
          if (!isNaN(tDate.getTime())) {
            const day = tDate.getDate();
            if (!calendar[day]) {
              calendar[day] = { total: 0, expenses: 0, income: 0, count: 0 };
            }
            const amount = parseFloat(t.amount || 0);
            if (!isNaN(amount)) {
              if (amount < 0) {
                // Expense
                calendar[day].expenses += Math.abs(amount);
                calendar[day].total += Math.abs(amount);
              } else {
                // Income
                calendar[day].income += amount;
              }
              calendar[day].count += 1;
            }
          }
        } catch (e) {
          // Skip invalid dates
        }
      });

      // Determine good/bad days (bad = high spending, good = low/no spending)
      const daysWithExpenses = Object.keys(calendar).filter(day => calendar[day].expenses > 0).length;
      const avgSpending = daysWithExpenses > 0 ? currentMonthTotal / daysWithExpenses : 0;
      const calendarWithStatus = {};
      Object.keys(calendar).forEach((day) => {
        const dayData = calendar[day];
        calendarWithStatus[day] = {
          ...dayData,
          isBad: avgSpending > 0 && dayData.expenses > avgSpending * 1.5,
          isGood: dayData.expenses === 0 || (avgSpending > 0 && dayData.expenses < avgSpending * 0.5),
        };
      });

      setCalendarData(calendarWithStatus);
    } catch (error) {
      console.error('Error loading manager data:', error);
      setManagerTransactions([]);
      // Don't set balance to 0 on error - it will be calculated from cards by the useEffect
      setSpendingBreakdown({});
      setMonthComparison(null);
      setCalendarData({});
    } finally {
      setManagerLoading(false);
    }
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

  const petName = petType === 'lumi' ? 'Lumi' : 'Luna';
  const petImage = petType === 'lumi' ? '/lumi.png' : '/luna.png';
  const petTalkGif = '/lumi-talk.gif';

  const presetMessage = (text) => {
    handleSendMessage(text);
  };

  const getMonthName = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[new Date().getMonth()];
  };

  const getCategoryData = () => {
    const categoryColors = {
      'Food': '#F87171',
      'Entertainment': '#93C5FD',
      'Transport': '#86EFAC',
      'Subscription': '#FDE047',
      'Shopping': '#A78BFA',
      'Bills': '#F59E0B',
      'Savings': '#10B981',
      'Income': '#34D399',
      'Other': '#9CA3AF',
      'General': '#6B7280',
    };

    const data = Object.keys(spendingBreakdown)
      .filter((key) => spendingBreakdown[key] > 0)
      .map((key) => ({
        name: key,
        color: categoryColors[key] || '#9CA3AF',
        key: key,
        percentage: spendingBreakdown[key],
      }));

    return data.sort((a, b) => b.percentage - a.percentage).slice(0, 4);
  };

  const categoryData = getCategoryData();
  const circumference = 251.3;
  
  const calculateOffsets = () => {
    let cumulativeOffset = 0;
    return categoryData.map((cat) => {
      const dashValue = (cat.percentage / 100) * circumference;
      const offset = cumulativeOffset;
      cumulativeOffset += dashValue;
      return { ...cat, dashValue, offset };
    });
  };
  
  const chartData = calculateOffsets();

  const getAvatar = (friend) => {
    if (friend.avatarImg) return friend.avatarImg;
    return friend.id % 2 === 0 ? '/lumi.png' : '/luna.png'; 
  };

  const sortedFriends = [...FRIENDS_LEADERBOARD].sort((a, b) => a.rank - b.rank);
  const first = sortedFriends.find(f => f.rank === 1) || sortedFriends[0];
  const second = sortedFriends.find(f => f.rank === 2) || sortedFriends[1];
  const third = sortedFriends.find(f => f.rank === 3) || sortedFriends[2];

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
            <div className="flex flex-col h-full">
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

              <div className="flex-1 flex flex-col items-center justify-end relative px-4 pb-8">
                {speechBubble.visible && (
                  <div
                    className="absolute bottom-[280px] z-20 max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-lg bg-white text-gray-800 border border-gray-100 transition-opacity duration-500"
                    style={{ opacity: speechBubble.opacity }}
                  >
                    {speechBubble.text}
                  </div>
                )}

                <div className="relative w-64 h-64 flex items-center justify-center">
                  <Image
                    src={speechBubble.visible && speechBubble.opacity === 1 && petType === 'lumi' ? petTalkGif : petImage}
                    alt={petName}
                    width={256}
                    height={256}
                    className="w-full h-full object-contain"
                    priority
                    unoptimized={speechBubble.visible && speechBubble.opacity === 1 && petType === 'lumi'}
                  />
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

              <div className="p-4 bg-white border-t border-gray-100 pb-20 md:pb-4">
                <div className="flex gap-2 bg-gray-50 p-2 rounded-full border border-gray-200">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputText.trim()) {
                        handleSendMessage(inputText);
                        setInputText('');
                      }
                    }}
                    placeholder="Type 'Spent $12 on...'"
                    className="flex-1 bg-transparent px-4 outline-none text-gray-700"
                  />
                  <button
                    onClick={() => {
                      if (inputText.trim()) {
                        handleSendMessage(inputText);
                        setInputText('');
                      }
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition active:scale-90 ${getAccentColor()}`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <div className="relative flex flex-col h-full bg-gray-50 px-4 pt-6 pb-24 overflow-y-auto">
              {managerLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 rounded-3xl shadow-lg mb-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-gray-300 text-sm mb-1">Total Balance</p>
                        <h1 className="text-4xl font-bold">${managerBalance.toFixed(2)}</h1>
                        {monthComparison !== null && (
                          <div className={`mt-4 flex items-center gap-2 text-sm ${monthComparison > 0 ? 'text-red-300' : 'text-green-300'}`}>
                            <Activity size={16} />
                            <span>
                              You spent {monthComparison > 0 ? '+' : ''}
                              {monthComparison.toFixed(0)}% vs last month
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => router.push('/cards')}
                        className="flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/30 hover:bg-white/25 transition"
                        aria-label="Manage cards"
                      >
                        <CreditCard size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800">{getMonthName()} Analysis</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Monthly</span>
                    </div>
                    {categoryData.length > 0 ? (
                      <div className="flex items-center justify-center gap-8 mb-4">
                        <div className="relative w-40 h-40">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#F3F4F6"
                              strokeWidth="20"
                            />
                            {chartData.map((cat, index) => (
                              <circle
                                key={cat.name}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={cat.color}
                                strokeWidth="20"
                                strokeDasharray={`${cat.dashValue} ${circumference}`}
                                strokeDashoffset={index === 0 ? 0 : `-${cat.offset}`}
                                className="transition-all hover:opacity-80"
                              />
                            ))}
                          </svg>
                        </div>
                        <div className="flex flex-col gap-3">
                          {categoryData.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                                <span className="text-xs text-gray-500">{cat.percentage.toFixed(0)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No spending data for this month yet
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800">Spending Calendar</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-600 mb-2">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs">
                      {(() => {
                        const now = new Date();
                        const currentMonth = now.getMonth();
                        const currentYear = now.getFullYear();
                        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
                        const days = [];
                        const today = now.getDate();

                        // Add empty cells for days before the first day of the month
                        for (let i = 0; i < firstDayOfMonth; i++) {
                          days.push(null);
                        }

                        // Add all days of the current month
                        for (let day = 1; day <= daysInMonth; day++) {
                          days.push(day);
                        }

                        return days.map((day, index) => {
                          if (day === null) {
                            return <div key={`empty-${index}`} className="aspect-square"></div>;
                          }

                          const dayData = calendarData[day];
                          const isBad = dayData?.isBad;
                          const isGood = dayData?.isGood;
                          const hasExpenses = dayData?.expenses > 0;
                          const hasIncome = dayData?.income > 0;
                          const isToday = day === today;

                          return (
                            <div
                              key={day}
                              className={`aspect-square flex flex-col items-center justify-center rounded-lg relative ${
                                isBad 
                                  ? 'bg-red-50 text-red-600' 
                                  : isGood 
                                    ? 'bg-green-50 text-green-600' 
                                    : hasExpenses || hasIncome
                                      ? 'bg-blue-50 text-blue-600'
                                      : 'bg-transparent text-gray-700'
                              } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                            >
                              <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                                {day}
                              </span>
                              {hasExpenses && (
                                <span className="text-[8px] text-red-500 font-bold mt-0.5">
                                  -${dayData.expenses.toFixed(0)}
                                </span>
                              )}
                              {hasIncome && (
                                <span className="text-[8px] text-green-500 font-bold mt-0.5">
                                  +${dayData.income.toFixed(0)}
                                </span>
                              )}
                              {!hasExpenses && !hasIncome && isBad && (
                                <div className="w-1 h-1 bg-red-400 rounded-full mt-1"></div>
                              )}
                              {!hasExpenses && !hasIncome && isGood && (
                                <div className="w-1 h-1 bg-green-400 rounded-full mt-1"></div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-50 border border-red-200"></div>
                        <span>High Spending</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-50 border border-green-200"></div>
                        <span>Low Spending</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-50 border border-blue-200"></div>
                        <span>Transactions</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center px-2 mb-4">
                      <h3 className="font-bold text-gray-800">Recent Activity</h3>
                    </div>
                    <div className="space-y-3">
                      {managerTransactions.length > 0 ? (
                        managerTransactions.slice(0, 10).map((t) => {
                          const amount = parseFloat(t.amount || 0);
                          return (
                            <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {amount > 0 ? <Plus size={16} /> : <ShoppingBag size={16} />}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800">{t.title || 'Untitled'}</p>
                                  <p className="text-xs text-gray-500">{t.category || 'Other'}</p>
                                </div>
                              </div>
                              <span className={`font-bold ${amount > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                {amount > 0 ? '+' : ''}${Math.abs(amount).toFixed(2)}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No transactions yet. Add your first transaction to get started!
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'social' && (
            <div className="flex flex-col h-full bg-slate-50 px-4 pt-6 pb-24 overflow-y-auto relative">
              {/* Original leaderboard content with reduced opacity */}
              <div className="opacity-30 pointer-events-none">
                <h2 className="text-center font-bold text-2xl text-slate-800 mb-6 flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" /> Leaderboard
                </h2>

                <div className="flex items-end justify-center gap-2 mb-10 mt-4">
                  <div className="flex flex-col items-center w-1/3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-200 shadow-md overflow-hidden bg-white">
                        <img src={getAvatar(second)} alt={second?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-1">
                        <Medal size={10} /> 2nd
                      </div>
                    </div>
                    <p className="font-bold text-sm text-slate-700 mt-4 line-clamp-1">{second?.name}</p>
                    <div className="flex items-center text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full mt-1">
                      <BadgeDollarSign size={10} /> {second?.balance.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-1/3 z-10 -mb-2">
                    <div className="relative">
                      <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-sm animate-bounce-slow" size={32} fill="currentColor" />
                      <div className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl overflow-hidden bg-white ring-4 ring-yellow-100">
                        <img src={getAvatar(first)} alt={first?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm">
                        1st
                      </div>
                    </div>
                    <p className="font-bold text-base text-slate-800 mt-5">{first?.name}</p>
                    <div className="flex items-center text-sm text-yellow-700 font-bold bg-yellow-50 px-3 py-1 rounded-full mt-1 border border-yellow-100">
                      <BadgeDollarSign size={12} /> {first?.balance.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-1/3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-orange-200 shadow-md overflow-hidden bg-white">
                        <img src={getAvatar(third)} alt={third?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-200 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-1">
                        <Medal size={10} /> 3rd
                      </div>
                    </div>
                    <p className="font-bold text-sm text-slate-700 mt-4 line-clamp-1">{third?.name}</p>
                    <div className="flex items-center text-xs text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full mt-1">
                      <BadgeDollarSign size={10} /> {third?.balance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">All Friends</h3>
                  {FRIENDS_LEADERBOARD.map((friend) => (
                    <div
                      key={friend.id}
                      className={`p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 ${
                        friend.isUser 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-md scale-[1.02]' 
                          : 'bg-white border border-slate-100 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className={`font-bold w-6 text-center text-sm ${
                        friend.rank <= 3 ? 'text-yellow-500' : 'text-slate-400'
                      }`}>
                        #{friend.rank}
                      </div>
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex-shrink-0 border border-slate-100 overflow-hidden">
                        <img src={getAvatar(friend)} alt={friend.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold truncate ${friend.isUser ? 'text-green-800' : 'text-slate-800'}`}>
                            {friend.name}
                          </h4>
                          {friend.isUser && (
                            <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-bold">YOU</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                          {friend.status}
                        </p>
                      </div>
                      <div className={`font-bold flex items-center gap-0.5 ${friend.isUser ? 'text-green-700' : 'text-slate-600'}`}>
                        <BadgeDollarSign size={14} strokeWidth={2.5} />
                        {friend.balance.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-500 transition-colors">
                  <Plus size={20} /> Add More Friends
                </button>
              </div>

              {/* Overlay "Stay Tuned!" message */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                      <Trophy size={32} className="text-yellow-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Stay Tuned!</h2>
                  <p className="text-gray-600 mb-4">The leaderboard is currently under construction.</p>
                  <p className="text-sm text-gray-500">We're working hard to bring you amazing features soon!</p>
                </div>
              </div>
            </div>
          )}
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
