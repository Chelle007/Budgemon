'use client';

import { ArrowLeft } from 'lucide-react';

export default function ShopView({
  onClose,
  gameCurrency,
  petType,
  inventory,
  onBuyItem,
  onEquipItem,
  items,
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-lg">Pet Shop</span>
          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
            <span>💰</span>
            <span className="font-bold text-yellow-800">{gameCurrency}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm border">
            {petType === 'lumi' ? '😺' : '😾'}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Equip Items</p>
            <p className="text-xs text-gray-500">Tap items below to buy & wear!</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => {
            const isOwned = inventory.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition"
              >
                <div className="text-5xl mb-2">{item.icon}</div>
                <h4 className="font-bold text-gray-800">{item.name}</h4>
                {isOwned ? (
                  <button
                    onClick={() => onEquipItem(item)}
                    className="w-full py-2 bg-gray-200 text-gray-600 rounded-xl text-sm font-bold"
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    onClick={() => onBuyItem(item)}
                    className="w-full py-2 bg-green-500 text-white rounded-xl text-sm font-bold shadow-green-200 hover:bg-green-600"
                  >
                    Buy ${item.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

