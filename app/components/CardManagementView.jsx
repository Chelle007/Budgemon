'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, CreditCard } from 'lucide-react';

export default function CardManagementView({ cards, onClose, onAddCard, onUpdateCard, onDeleteCard }) {
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

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      name: card.name || '',
      cardNumber: card.cardNumber || '',
      cardholderName: card.cardholderName || '',
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
      onUpdateCard(editingCard.id, cardData);
    } else {
      onAddCard(cardData);
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

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Close"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Manage Cards</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {!isEditing ? (
          <>
            <div className="mb-6">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 rounded-3xl shadow-lg">
                <p className="text-gray-300 text-sm mb-1">Total Balance Across All Cards</p>
                <h2 className="text-3xl font-bold">${totalBalance.toFixed(2)}</h2>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Your Cards</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-full shadow-sm hover:bg-gray-800 transition"
              >
                <Plus size={16} />
                Add Card
              </button>
            </div>

            {cards.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
                <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No cards yet</p>
                <p className="text-sm text-gray-400">Add your first card to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-2"
                      style={{ backgroundColor: card.color }}
                    />
                    <div className="mt-2">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg mb-1">{card.name}</h3>
                          {card.cardholderName && (
                            <p className="text-sm text-gray-500">{card.cardholderName}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(card)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            aria-label="Edit card"
                          >
                            <Edit2 size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${card.name}?`)) {
                                onDeleteCard(card.id);
                              }
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition"
                            aria-label="Delete card"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                      {card.cardNumber && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-1">Card Number</p>
                          <p className="font-mono text-gray-700">
                            {formatCardNumber(card.cardNumber)}
                          </p>
                        </div>
                      )}
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Balance</p>
                        <p className="text-2xl font-bold text-gray-800">
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
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingCard ? 'Edit Card' : 'Add New Card'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Chase Sapphire"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                          ? 'border-gray-900 scale-105'
                          : 'border-gray-200 hover:border-gray-300'
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
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition"
              >
                {editingCard ? 'Update Card' : 'Add Card'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


