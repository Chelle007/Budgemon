'use client';

export default function PetSelectionView({ onSelectPet }) {
  return (
    <div className="flex flex-col h-screen bg-white p-6">
      <h2 className="text-2xl font-bold text-center mt-8 mb-2">Choose your Companion</h2>
      <p className="text-center text-gray-500 mb-8">This determines your coaching style.</p>

      <div className="flex-1 space-y-6 overflow-y-auto">
        <div
          onClick={() => onSelectPet('lumi')}
          className="p-6 rounded-3xl border-2 border-cyan-100 bg-cyan-50 hover:border-cyan-400 transition cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-cyan-200 rounded-full flex items-center justify-center text-3xl shadow-inner">😇</div>
            <div>
              <h3 className="text-xl font-bold text-cyan-800">Lumi</h3>
              <span className="text-xs bg-cyan-200 text-cyan-800 px-2 py-1 rounded-full">Supportive</span>
            </div>
          </div>
          <p className="text-cyan-700 text-sm">"It's okay! I'm here with you. Let's celebrate your small wins!"</p>
        </div>

        <div
          onClick={() => onSelectPet('luna')}
          className="p-6 rounded-3xl border-2 border-purple-100 bg-purple-50 hover:border-purple-400 transition cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center text-3xl shadow-inner">😈</div>
            <div>
              <h3 className="text-xl font-bold text-purple-800">Luna</h3>
              <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Asian Mom Mode</span>
            </div>
          </div>
          <p className="text-purple-700 text-sm">"$20 for Starbucks? NO WAY. You need better habits immediately."</p>
        </div>
      </div>
    </div>
  );
}

