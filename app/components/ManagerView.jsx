'use client';

import { Activity, Plus, ShoppingBag, CreditCard } from 'lucide-react';

export default function ManagerView({ balance, transactions, onAddTransaction, onOpenCardManagement }) {
  return (
    <div className="relative flex flex-col h-full bg-gray-50 px-4 pt-6 pb-24 overflow-y-auto">
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
          <h3 className="font-bold text-gray-800">November Analysis</h3>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Weekly</span>
        </div>
        <div className="flex items-center justify-center gap-8 mb-4">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#FEE2E2"
                strokeWidth="20"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#F87171"
                strokeWidth="20"
                strokeDasharray={`${42 * 2.513} 251.3`}
                className="transition-all hover:opacity-80"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#93C5FD"
                strokeWidth="20"
                strokeDasharray={`${30 * 2.513} 251.3`}
                strokeDashoffset={`-${42 * 2.513}`}
                className="transition-all hover:opacity-80"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#86EFAC"
                strokeWidth="20"
                strokeDasharray={`${18 * 2.513} 251.3`}
                strokeDashoffset={`-${(42 + 30) * 2.513}`}
                className="transition-all hover:opacity-80"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#FDE047"
                strokeWidth="20"
                strokeDasharray={`${10 * 2.513} 251.3`}
                strokeDashoffset={`-${(42 + 30 + 18) * 2.513}`}
                className="transition-all hover:opacity-80"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">Food</span>
                <span className="text-xs text-gray-500">42%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">Leisure</span>
                <span className="text-xs text-gray-500">30%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">Travel</span>
                <span className="text-xs text-gray-500">18%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">Subs</span>
                <span className="text-xs text-gray-500">10%</span>
              </div>
            </div>
          </div>
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
        <div className="flex items-center px-2 mb-4">
          <h3 className="font-bold text-gray-800">Recent Activity</h3>
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

