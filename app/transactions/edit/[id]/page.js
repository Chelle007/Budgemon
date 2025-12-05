'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { useUser } from '../../../context/UserContext';

const CATEGORY_OPTIONS = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Savings', 'Other'];

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id;
  const { user, loading, cards, transactions, handleTransactionUpdate, handleTransactionDelete, fetchTransactions } = useUser();
  const today = new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(true);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Load transaction data
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!user || !transactionId || loading) {
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      return;
    }

    const foundTransaction = transactions.find(t => t.id === transactionId);
    
    if (foundTransaction) {
      // Transaction found - set it if we haven't already
      if (!hasLoadedRef.current || transaction?.id !== foundTransaction.id) {
        setTransaction(foundTransaction);
        setTitle(foundTransaction.title || '');
        setAmount(Math.abs(parseFloat(foundTransaction.amount || 0)).toString());
        setType(foundTransaction.type || 'expense');
        setCategory(foundTransaction.category || CATEGORY_OPTIONS[0]);
        setDate(foundTransaction.date || today);
        setNote(foundTransaction.note || '');
        setSelectedCardId(foundTransaction.card_id || null);
        setIsLoadingTransaction(false);
        setError('');
        hasLoadedRef.current = true;
      }
    } else if (transactions.length > 0) {
      // Transactions loaded but this one not found
      if (!hasLoadedRef.current) {
        setError('Transaction not found.');
        setIsLoadingTransaction(false);
        hasLoadedRef.current = true;
      }
    } else if (fetchTransactions && !isLoadingRef.current) {
      // Try fetching transactions if array is empty
      isLoadingRef.current = true;
      setIsLoadingTransaction(true);
      fetchTransactions()
        .then(() => {
          isLoadingRef.current = false;
        })
        .catch(err => {
          console.error('Error fetching transactions:', err);
          setError('Failed to load transaction. Please try again.');
          setIsLoadingTransaction(false);
          isLoadingRef.current = false;
        });
    }
  }, [user, loading, transactionId, transactions, transaction?.id, fetchTransactions]); // Removed 'today' to prevent infinite loops

  const handleSubmit = async (e) => {
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
    try {
      await handleTransactionUpdate(transactionId, {
        title: title.trim(),
        amount: parsedAmount,
        category,
        type,
        date,
        note: note.trim(),
        cardId: selectedCardId,
      });
      router.push('/app?tab=dashboard');
    } catch (error) {
      setError('Failed to update transaction. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await handleTransactionDelete(transactionId);
      router.push('/app?tab=dashboard');
    } catch (error) {
      setError('Failed to delete transaction. Please try again.');
      setIsDeleting(false);
    }
  };

  if (loading || isLoadingTransaction) {
    return (
      <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!transaction) {
    return (
      <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-gray-600 mb-4">{error || 'Transaction not found.'}</p>
          <button
            onClick={() => router.push('/app?tab=dashboard')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 shadow-2xl overflow-hidden">
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <button
            onClick={() => router.push('/app?tab=dashboard')}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label="Back to manager"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-800">Edit Transaction</h2>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-full border border-red-200 hover:bg-red-50 text-red-600 disabled:opacity-50"
            aria-label="Delete transaction"
          >
            <Trash2 size={20} />
          </button>
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

          {cards.length > 0 && (
            <label className="block">
              <span className="text-sm font-semibold text-gray-600">Card</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCardId(null)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    selectedCardId === null
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}
                >
                  <span>None</span>
                  {selectedCardId === null && <Check size={16} />}
                </button>
                {cards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCardId(card.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold relative overflow-hidden ${
                      selectedCardId === card.id
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-50 text-gray-600 border-gray-100'
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
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => router.push('/app?tab=dashboard')}
              className="w-full mt-3 py-3 rounded-2xl text-gray-500 font-semibold hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

