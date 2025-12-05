'use client';

import { useState, useEffect } from 'react';
import { Activity, Plus, ShoppingBag, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ManagerView({ user, onAddTransaction, onOpenCardManagement }) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [spendingBreakdown, setSpendingBreakdown] = useState({});
  const [monthComparison, setMonthComparison] = useState(null);
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    if (user) {
      loadData();

      // Subscribe to transaction changes
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
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadData = async () => {
    if (!user || !user.id) {
      console.warn('ManagerView: No user or user.id available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get current date info
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Fetch all transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) {
        console.error('Supabase transactions error:', transactionsError);
        throw transactionsError;
      }

      // Initialize with empty data if no transactions
      const safeTransactionsData = transactionsData || [];
      
      setTransactions(safeTransactionsData);

      // Calculate total balance
      const total = safeTransactionsData.reduce((sum, t) => {
        const amount = parseFloat(t.amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      setBalance(total);

      // Calculate spending breakdown for current month (expenses only)
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
          console.warn('Invalid date in transaction:', t.date, e);
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

      // Convert to percentages
      const breakdownPercentages = {};
      Object.keys(breakdown).forEach((category) => {
        breakdownPercentages[category] = totalExpenses > 0 ? (breakdown[category] / totalExpenses) * 100 : 0;
      });

      setSpendingBreakdown(breakdownPercentages);

      // Calculate month-over-month comparison
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

      // Calculate calendar data for current month
      const calendar = {};
      currentMonthTransactions.forEach((t) => {
        try {
          const tDate = new Date(t.date);
          if (!isNaN(tDate.getTime())) {
            const day = tDate.getDate();
            if (!calendar[day]) {
              calendar[day] = { total: 0, count: 0 };
            }
            const amount = Math.abs(parseFloat(t.amount || 0));
            if (!isNaN(amount)) {
              calendar[day].total += amount;
              calendar[day].count += 1;
            }
          }
        } catch (e) {
          // Skip invalid dates
        }
      });

      // Determine good/bad days (bad = high spending, good = low/no spending)
      const daysWithTransactions = Object.keys(calendar).length;
      const avgSpending = daysWithTransactions > 0 ? currentMonthTotal / daysWithTransactions : 0;
      const calendarWithStatus = {};
      Object.keys(calendar).forEach((day) => {
        const dayData = calendar[day];
        calendarWithStatus[day] = {
          ...dayData,
          isBad: avgSpending > 0 && dayData.total > avgSpending * 1.5,
          isGood: dayData.total === 0 || (avgSpending > 0 && dayData.total < avgSpending * 0.5),
        };
      });

      setCalendarData(calendarWithStatus);
    } catch (error) {
      console.error('Error loading manager data:', error);
      // Set empty state on error
      setTransactions([]);
      setBalance(0);
      setSpendingBreakdown({});
      setMonthComparison(null);
      setCalendarData({});
    } finally {
      setLoading(false);
    }
  };

  // Get month name
  const getMonthName = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[new Date().getMonth()];
  };

  // Calculate circle chart data
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

    // Get all categories with their percentages
    const data = Object.keys(spendingBreakdown)
      .filter((key) => spendingBreakdown[key] > 0)
      .map((key) => ({
        name: key,
        color: categoryColors[key] || '#9CA3AF',
        key: key,
        percentage: spendingBreakdown[key],
      }));

    // Sort by percentage and take top 4
    return data.sort((a, b) => b.percentage - a.percentage).slice(0, 4);
  };

  const categoryData = getCategoryData();
  const circumference = 251.3; // 2 * PI * 40
  
  // Calculate cumulative offsets for circle chart
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-gray-50 px-4 pt-6 pb-24 overflow-y-auto">
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 rounded-3xl shadow-lg mb-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-gray-300 text-sm mb-1">Total Balance</p>
            <h1 className="text-4xl font-bold">${balance.toFixed(2)}</h1>
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
            onClick={onOpenCardManagement}
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
        <h3 className="font-bold text-gray-800 mb-4">Spending Calendar</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-600">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
          {(() => {
            const now = new Date();
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
            const days = [];

            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDayOfMonth; i++) {
              days.push(null);
            }

            // Add all days of the month
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

              return (
                <div
                  key={day}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg ${
                    isBad ? 'bg-red-50 text-red-500' : isGood ? 'bg-green-50 text-green-600' : 'bg-transparent'
                  }`}
                >
                  {day}
                  {isBad && <div className="w-1 h-1 bg-red-400 rounded-full mt-1"></div>}
                  {isGood && <div className="w-1 h-1 bg-green-400 rounded-full mt-1"></div>}
                </div>
              );
            });
          })()}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center px-2 mb-4">
          <h3 className="font-bold text-gray-800">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.slice(0, 10).map((t) => {
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
    </div>
  );
}

