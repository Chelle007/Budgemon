'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, CreditCard } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function CardsPage() {
  const router = useRouter();
  const { user, loading, cards, handleAddCard, handleUpdateCard, handleDeleteCard, darkMode } = useUser();
  const isDark = darkMode || false;
  const [isEditing, setIsEditing] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    cardholderName: '',
    balance: '',
    color: '#3B82F6',
  });

  const cardColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleEdit = (card) => {
    setEditingCard(card);
    // Handle both camelCase (from Supabase) and snake_case (direct from DB)
    const cardNumber = card.cardNumber || card.card_number || '';
    const cardholderName = card.cardholderName || card.cardholder_name || '';
    setFormData({
      name: card.name || '',
      cardNumber: cardNumber,
      cardholderName: cardholderName,
      balance: card.balance?.toString() || '',
      color: card.color || '#3B82F6',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingCard(null);
    setFormData({
      name: '',
      cardNumber: '',
      cardholderName: '',
      balance: '',
      color: '#3B82F6',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cardData = {
      name: formData.name.trim(),
      cardNumber: formData.cardNumber.trim(),
      cardholderName: formData.cardholderName.trim(),
      balance: parseFloat(formData.balance) || 0,
      color: formData.color,
    };

    if (!cardData.name) {
      alert('Please enter a card name');
      return;
    }

    if (isEditing && editingCard) {
      handleUpdateCard(editingCard.id, cardData);
    } else {
      handleAddCard(cardData);
    }

    handleCancel();
  };

  const formatCardNumber = (number) => {
    if (!number) return '';
    const cleaned = number.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19);
  };

  const totalBalance = cards.reduce((sum, card) => sum + (card.balance || 0), 0);

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
      <div className={`h-full flex flex-col ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className={`border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <button
            onClick={() => router.push('/app?tab=dashboard')}
            className={`p-2 rounded-full transition ${isDark ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100'}`}
            aria-label="Close"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Manage Cards</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {!isEditing ? (
            <>
              <div className="mb-6">
                <div className={`p-6 rounded-3xl shadow-lg ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-gray-800 to-gray-700'} text-white`}>
                  <p className="text-gray-300 text-sm mb-1">Total Balance Across All Cards</p>
                  <h2 className="text-3xl font-bold">${totalBalance.toFixed(2)}</h2>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Your Cards</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-full shadow-sm transition ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 hover:bg-gray-800'}`}
                >
                  <Plus size={16} />
                  Add Card
                </button>
              </div>

              {cards.length === 0 ? (
                <div className={`p-8 rounded-2xl text-center border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                  <CreditCard size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={isDark ? 'text-gray-400 mb-2' : 'text-gray-500 mb-2'}>No cards yet</p>
                  <p className={isDark ? 'text-sm text-gray-500' : 'text-sm text-gray-400'}>Add your first card to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`p-6 rounded-2xl shadow-sm border relative overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-2"
                        style={{ backgroundColor: card.color }}
                      />
                      <div className="mt-2">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{card.name}</h3>
                            {(card.cardholderName || card.cardholder_name) && (
                              <p className={isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-500'}>{card.cardholderName || card.cardholder_name}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(card)}
                              className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                              aria-label="Edit card"
                            >
                              <Edit2 size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${card.name}?`)) {
                                  handleDeleteCard(card.id);
                                }
                              }}
                              className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-red-900/50' : 'hover:bg-red-50'}`}
                              aria-label="Delete card"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                        {(card.cardNumber || card.card_number) && (
                          <div className="mb-4">
                            <p className={isDark ? 'text-xs text-gray-500 mb-1' : 'text-xs text-gray-400 mb-1'}>Card Number</p>
                            <p className={`font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatCardNumber(card.cardNumber || card.card_number)}
                            </p>
                          </div>
                        )}
                        <div className={`pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                          <p className={isDark ? 'text-xs text-gray-500 mb-1' : 'text-xs text-gray-400 mb-1'}>Balance</p>
                          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            ${(card.balance || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {editingCard ? 'Edit Card' : 'Add New Card'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Card Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Chase Sapphire"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-gray-600' : 'border-gray-300 text-gray-900 focus:ring-gray-900'}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                      setFormData({ ...formData, cardNumber: value });
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 font-mono ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-gray-600' : 'border-gray-300 text-gray-900 focus:ring-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-gray-600' : 'border-gray-300 text-gray-900 focus:ring-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-gray-600' : 'border-gray-300 text-gray-900 focus:ring-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Card Color
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {cardColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`h-12 rounded-xl border-2 transition ${
                          formData.color === color.value
                            ? (isDark ? 'border-white scale-105' : 'border-gray-900 scale-105')
                            : (isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300')
                        }`}
                        style={{ backgroundColor: color.value }}
                        aria-label={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`flex-1 px-4 py-3 border font-semibold rounded-xl transition ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl transition ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 hover:bg-gray-800'}`}
                >
                  {editingCard ? 'Update Card' : 'Add Card'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
