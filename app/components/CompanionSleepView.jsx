'use client';

import { useState, useEffect } from 'react';
import { Send, User, BadgeDollarSign } from 'lucide-react';
import Image from 'next/image';

export default function CompanionSleepView({
  petType,
  gameCurrency,
  onOpenShop,
  onOpenProfile,
  accentColorClass,
}) {
  const [petName, setPetName] = useState('Lumi');

  useEffect(() => {
    setPetName(petType === 'lumi' ? 'Lumi' : 'Luna');
  }, [petType]);

  // For now, sleeping mode always uses Lumi's looping sleep GIF as requested
  const petSleepGif = '/lumi-sleep-repeat.gif';

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header matches CompanionView and stays interactive */}
      <div className="px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className={`text-lg font-bold ${petType === 'lumi' ? 'text-cyan-800' : 'text-purple-800'}`}>
          {petName}
        </h2>
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenShop}
            className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200 cursor-pointer hover:bg-yellow-200"
          >
            <BadgeDollarSign size={18} className="text-yellow-800" />
            <span className="font-bold text-yellow-800">{gameCurrency}</span>
          </div>
          <button
            onClick={onOpenProfile}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
            aria-label="Profile"
          >
            <User size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-end relative px-4 pb-8 pointer-events-none">
        {/* Sleeping "reply" text above pet */}
        <div className="absolute bottom-[280px] z-20 max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-lg bg-white text-gray-800 border border-gray-100">
          Zzz... Lumi is sleeping...
        </div>

        {/* Sleeping Pet Image */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <Image
            src={petSleepGif}
            alt={`${petName} sleeping`}
            width={256}
            height={256}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      </div>

      {/* Bottom area is visually similar but non-interactive */}
      <div className="p-4 bg-white border-t border-gray-100 pb-20 md:pb-4">
        <div className="flex gap-2 bg-gray-50 p-2 rounded-full border border-gray-200 opacity-70 pointer-events-none">
          <input
            type="text"
            disabled
            placeholder="Lumi is sleeping..."
            className="flex-1 bg-transparent px-4 outline-none text-gray-400"
          />
          <button
            disabled
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ${accentColorClass} opacity-60`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}


