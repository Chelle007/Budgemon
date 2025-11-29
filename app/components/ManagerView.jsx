'use client';

import { Activity, Plus, ShoppingBag } from 'lucide-react';

export default function ManagerView({ balance, transactions, onAddTransaction }) {
  return (
    <div className="flex flex-col h-full bg-gray-50 px-4 pt-6 pb-24 overflow-y-auto">
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 rounded-3xl shadow-lg mb-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-gray-300 text-sm mb-1">Total Balance</p>
            <h1 className="text-4xl font-bold">${balance.toFixed(2)}</h1>
            <div className="mt-4 flex items-center gap-2 text-red-300 text-sm">
              <Activity size={16} />
              <span>You spent +49% vs last month</span>
            </div>
          </div>
          <button
            onClick={onAddTransaction}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/30 hover:bg-white/25 transition"
            aria-label="Add transaction"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">November Analysis</h3>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Weekly</span>
        </div>
        <div className="flex items-end justify-between h-32 gap-2 mb-2">
          <div className="w-full bg-red-100 rounded-t-lg relative group h-[42%]">
            <div className="absolute bottom-0 w-full bg-red-400 rounded-t-lg h-full transition-all group-hover:bg-red-500"></div>
          </div>
          <div className="w-full bg-blue-100 rounded-t-lg relative group h-[30%]">
            <div className="absolute bottom-0 w-full bg-blue-400 rounded-t-lg h-full transition-all group-hover:bg-blue-500"></div>
          </div>
          <div className="w-full bg-green-100 rounded-t-lg relative group h-[18%]">
            <div className="absolute bottom-0 w-full bg-green-400 rounded-t-lg h-full transition-all group-hover:bg-green-500"></div>
          </div>
          <div className="w-full bg-yellow-100 rounded-t-lg relative group h-[10%]">
            <div className="absolute bottom-0 w-full bg-yellow-400 rounded-t-lg h-full transition-all group-hover:bg-yellow-500"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Food</span>
          <span>Leisure</span>
          <span>Travel</span>
          <span>Subs</span>
        </div>
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
          {[...Array(30)].map((_, i) => {
            const day = i + 1;
            const isBad = [13, 25, 5].includes(day);
            const isGood = [12, 8].includes(day);
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
          })}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="font-bold text-gray-800">Recent Activity</h3>
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-semibold rounded-full shadow-sm hover:bg-gray-800 transition"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${t.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {t.amount > 0 ? <Plus size={16} /> : <ShoppingBag size={16} />}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.category}</p>
                </div>
              </div>
              <span className={`font-bold ${t.amount > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                {t.amount > 0 ? '+' : ''}
                {t.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

