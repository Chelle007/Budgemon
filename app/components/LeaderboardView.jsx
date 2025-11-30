'use client';

import React from 'react';
import { BadgeDollarSign, Plus, Crown, Medal, Trophy } from 'lucide-react';

export default function LeaderboardView({ friends }) {
  // Ensure we have the top 3 for the podium
  // Assuming friends are sorted by rank, but safe to sort here
  const sortedFriends = [...friends].sort((a, b) => a.rank - b.rank);
  const first = sortedFriends.find(f => f.rank === 1) || sortedFriends[0];
  const second = sortedFriends.find(f => f.rank === 2) || sortedFriends[1];
  const third = sortedFriends.find(f => f.rank === 3) || sortedFriends[2];

  // Helper to get image or fallback (alternating between lumi/luna if data is missing)
  const getAvatar = (friend) => {
    if (friend.avatarImg) return friend.avatarImg;
    // Fallback logic if your data doesn't have images yet
    return friend.id % 2 === 0 ? '/lumi.png' : '/luna.png'; 
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 px-4 pt-6 pb-24 overflow-y-auto">
      <h2 className="text-center font-bold text-2xl text-slate-800 mb-6 flex items-center justify-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" /> Leaderboard
      </h2>

      {/* --- Podium Section --- */}
      <div className="flex items-end justify-center gap-2 mb-10 mt-4">
        
        {/* 2nd Place */}
        <div className="flex flex-col items-center w-1/3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 shadow-md overflow-hidden bg-white">
              <img src={getAvatar(second)} alt={second?.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-1">
              <Medal size={10} /> 2nd
            </div>
          </div>
          <p className="font-bold text-sm text-slate-700 mt-4 line-clamp-1">{second?.name}</p>
          <div className="flex items-center text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full mt-1">
            <BadgeDollarSign size={10} /> {second?.balance.toLocaleString()}
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center w-1/3 z-10 -mb-2">
          <div className="relative">
            <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-sm animate-bounce-slow" size={32} fill="currentColor" />
            <div className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl overflow-hidden bg-white ring-4 ring-yellow-100">
               <img src={getAvatar(first)} alt={first?.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm">
              1st
            </div>
          </div>
          <p className="font-bold text-base text-slate-800 mt-5">{first?.name}</p>
          <div className="flex items-center text-sm text-yellow-700 font-bold bg-yellow-50 px-3 py-1 rounded-full mt-1 border border-yellow-100">
            <BadgeDollarSign size={12} /> {first?.balance.toLocaleString()}
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center w-1/3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-orange-200 shadow-md overflow-hidden bg-white">
               <img src={getAvatar(third)} alt={third?.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-200 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-1">
              <Medal size={10} /> 3rd
            </div>
          </div>
          <p className="font-bold text-sm text-slate-700 mt-4 line-clamp-1">{third?.name}</p>
           <div className="flex items-center text-xs text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full mt-1">
            <BadgeDollarSign size={10} /> {third?.balance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* --- List Section --- */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">All Friends</h3>
        {friends.map((friend) => (
          <div
            key={friend.id}
            className={`p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 ${
              friend.isUser 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-md scale-[1.02]' 
                : 'bg-white border border-slate-100 shadow-sm hover:shadow-md'
            }`}
          >
            {/* Rank Number */}
            <div className={`font-bold w-6 text-center text-sm ${
              friend.rank <= 3 ? 'text-yellow-500' : 'text-slate-400'
            }`}>
              #{friend.rank}
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 bg-slate-50 rounded-full flex-shrink-0 border border-slate-100 overflow-hidden">
               <img src={getAvatar(friend)} alt={friend.name} className="w-full h-full object-cover" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`font-bold truncate ${friend.isUser ? 'text-green-800' : 'text-slate-800'}`}>
                  {friend.name}
                </h4>
                {friend.isUser && (
                  <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-bold">YOU</span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                {friend.status}
              </p>
            </div>

            {/* Balance */}
            <div className={`font-bold flex items-center gap-0.5 ${friend.isUser ? 'text-green-700' : 'text-slate-600'}`}>
              <BadgeDollarSign size={14} strokeWidth={2.5} />
              {friend.balance.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Add Friend Button */}
      <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-500 transition-colors">
        <Plus size={20} /> Add More Friends
      </button>
    </div>
  );
}