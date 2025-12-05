'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const CATEGORY_OPTIONS = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Savings', 'Other'];

export default function AddTransactionPage() {
  const router = useRouter();
  const { user, loading, cards, handleTransactionSubmit, darkMode } = useUser();
  const isDark = darkMode || false;
  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [selectedCardId, setSelectedCardId] = useState(cards.length > 0 ? cards[0].id : null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      setError('Please enter a title and amount.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setError('');
    handleTransactionSubmit({
      title: title.trim(),
      amount: parsedAmount,
      category,
      type,
      date,
      note: note.trim(),
      cardId: selectedCardId,
    });
  };

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
    <div className={`font-sans max-w-md mx-auto h-screen shadow-2xl overflow-hidden ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
      <div className={`flex flex-col h-full ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-100'}`}>
          <button
            onClick={() => router.push('/app?tab=dashboard')}
            className={`p-2 rounded-full border transition ${isDark ? 'border-gray-700 hover:bg-gray-900 text-white' : 'border-gray-200 hover:bg-gray-50'}`}
            aria-label="Back to manager"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Add Transaction</h2>
          <div className="w-8" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div className="flex gap-3">
            {['expense', 'income'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`flex-1 py-3 rounded-2xl border font-semibold capitalize ${
                  type === option 
                    ? (isDark ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-900 text-white border-gray-900')
                    : (isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-100')
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <label className="block">
            <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Groceries at Trader Joe's"
              className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-gray-600' : 'border-gray-200 text-gray-800 focus:ring-gray-900/10'}`}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Amount ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-gray-600' : 'border-gray-200 text-gray-800 focus:ring-gray-900/10'}`}
              />
            </label>

            <label className="block">
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Date</span>
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-gray-600' : 'border-gray-200 text-gray-800 focus:ring-gray-900/10'}`}
              />
            </label>
          </div>

          <label className="block">
            <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Category</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    category === option
                      ? (isDark ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-900 text-white border-gray-900')
                      : (isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-100')
                  }`}
                >
                  {option}
                  {category === option && <Check size={16} />}
                </button>
              ))}
            </div>
          </label>

          {cards.length > 0 && (
            <label className="block">
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Card</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCardId(card.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold relative overflow-hidden ${
                      selectedCardId === card.id
                        ? (isDark ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-900 text-white border-gray-900')
                        : (isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-100')
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: card.color }}
                      />
                      <span className="truncate">{card.name}</span>
                    </div>
                    {selectedCardId === card.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            </label>
          )}

          <label className="block">
            <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Notes (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Anything you want to remember about this transaction?"
              className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-gray-600' : 'border-gray-200 text-gray-800 focus:ring-gray-900/10'}`}
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="pt-2 pb-10">
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl text-white font-bold shadow-lg transition ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 hover:bg-gray-800'}`}
            >
              Save Transaction
            </button>
            <button
              type="button"
              onClick={() => router.push('/app?tab=dashboard')}
              className={`w-full mt-3 py-3 rounded-2xl font-semibold transition ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
