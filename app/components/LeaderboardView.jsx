'use client';

export default function LeaderboardView({ friends }) {
  return (
    <div className="flex flex-col h-full bg-white px-4 pt-8 pb-24 overflow-y-auto">
      <h2 className="text-center font-bold text-2xl mb-8">Leaderboard</h2>

      <div className="flex items-end justify-center gap-4 mb-10">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full border-2 border-gray-300 flex items-center justify-center text-3xl mb-2 relative">
            🌸
            <div className="absolute -bottom-3 bg-gray-300 text-white text-xs px-2 py-0.5 rounded-full">2nd</div>
          </div>
          <p className="font-bold text-sm">Michelle</p>
          <p className="text-xs text-gray-500">$1,123</p>
        </div>
        <div className="flex flex-col items-center relative -top-4">
          <div className="text-3xl absolute -top-10 text-yellow-500">👑</div>
          <div className="w-20 h-20 bg-yellow-50 rounded-full border-2 border-yellow-400 flex items-center justify-center text-4xl mb-2 relative shadow-lg">
            😎
            <div className="absolute -bottom-3 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">1st</div>
          </div>
          <p className="font-bold text-base">Desmond</p>
          <p className="text-xs text-yellow-600 font-bold">$1,450</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full border-2 border-orange-200 flex items-center justify-center text-3xl mb-2 relative">
            🎨
            <div className="absolute -bottom-3 bg-orange-300 text-white text-xs px-2 py-0.5 rounded-full">3rd</div>
          </div>
          <p className="font-bold text-sm">Reynaldi</p>
          <p className="text-xs text-gray-500">$956</p>
        </div>
      </div>

      <div className="space-y-4">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className={`p-4 rounded-2xl flex items-center gap-4 ${
              friend.isUser ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100 shadow-sm'
            }`}
          >
            <div className="font-bold text-gray-400 w-4 text-center">{friend.rank}</div>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-100">
              {friend.avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">
                {friend.name} {friend.isUser && '(You)'}
              </h4>
              <p className="text-xs text-gray-500 leading-tight">{friend.status}</p>
            </div>
            <div className="font-bold text-green-600">${friend.balance}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition">
        + Add More Friends
      </div>
    </div>
  );
}

