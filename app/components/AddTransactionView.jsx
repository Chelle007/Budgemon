'use client';

import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

const CATEGORY_OPTIONS = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Savings', 'Other'];

export default function AddTransactionView({ onClose, onSubmit }) {
  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

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
    onSubmit({
      title: title.trim(),
      amount: parsedAmount,
      category,
      type,
      date,
      note: note.trim(),
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
          aria-label="Back to manager"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Add Transaction</h2>
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
                type === option ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-600 border-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-gray-600">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Groceries at Trader Joe's"
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-600">Amount ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-600">Date</span>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-gray-600">Category</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  category === option
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-gray-50 text-gray-600 border-gray-100'
                }`}
              >
                {option}
                {category === option && <Check size={16} />}
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-600">Notes (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Anything you want to remember about this transaction?"
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="pt-2 pb-10">
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold shadow-lg shadow-gray-900/10 hover:bg-gray-800 transition"
          >
            Save Transaction
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-3 py-3 rounded-2xl text-gray-500 font-semibold hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

