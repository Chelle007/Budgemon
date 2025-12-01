'use client';

import Image from 'next/image';

export default function PetSelectionView({ onSelectPet }) {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-center mt-6 mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Choose your Companion
          </h2>
          <p className="text-gray-600 text-base">This determines your coaching style</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pb-6">
          {/* Lumi Card */}
          <div
            onClick={() => onSelectPet('lumi')}
            className="relative p-4 rounded-2xl border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 cursor-pointer active:opacity-80"
          >
            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-36 h-36 mb-3">
                <Image
                  src="/lumi-large.png"
                  alt="Lumi"
                  width={144}
                  height={144}
                  className="object-contain w-full h-full"
                />
              </div>
              
              <div className="mb-2">
                <h3 className="text-xl font-bold text-cyan-800 mb-1">Lumi</h3>
                <span className="inline-block text-xs bg-gradient-to-r from-cyan-200 to-blue-200 text-cyan-800 px-2.5 py-0.5 rounded-full font-semibold">
                  Supportive
                </span>
              </div>
              
              <p className="text-cyan-700 text-xs leading-relaxed max-w-xs italic">
                "It's okay! I'm here with you. Let's celebrate your small wins!"
              </p>
            </div>
          </div>

          {/* Luna Card */}
          <div
            onClick={() => onSelectPet('luna')}
            className="relative p-4 rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-fuchsia-50 cursor-pointer active:opacity-80"
          >
            <div className="relative flex flex-col items-center text-center">
              <div className="relative w-36 h-36 mb-3">
                <Image
                  src="/luna.png"
                  alt="Luna"
                  width={144}
                  height={144}
                  className="object-contain w-full h-full"
                />
              </div>
              
              <div className="mb-2">
                <h3 className="text-xl font-bold text-purple-800 mb-1">Luna</h3>
                <span className="inline-block text-xs bg-gradient-to-r from-purple-200 to-fuchsia-200 text-purple-800 px-2.5 py-0.5 rounded-full font-semibold">
                  Asian Mom Mode
                </span>
              </div>
              
              <p className="text-purple-700 text-xs leading-relaxed max-w-xs italic">
                "$20 for Starbucks? NO WAY. You need better habits immediately."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

