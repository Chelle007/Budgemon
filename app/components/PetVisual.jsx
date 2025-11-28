'use client';

export default function PetVisual({ petType, equipped }) {
  return (
    <div className="relative w-48 h-48 mx-auto my-6 transition-all duration-500">
      <div
        className={`w-full h-full rounded-full flex items-center justify-center text-[8rem] shadow-2xl transition-colors duration-500 ${
          petType === 'lumi'
            ? 'bg-gradient-to-tr from-cyan-200 to-blue-100 border-4 border-white ring-4 ring-cyan-100'
            : 'bg-gradient-to-tr from-purple-300 to-fuchsia-100 border-4 border-white ring-4 ring-purple-100'
        }`}
      >
        <span className="animate-bounce-slow">{petType === 'lumi' ? '😺' : '😾'}</span>
      </div>

      {equipped.head && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg">{equipped.head}</div>
      )}
      {equipped.eyes && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 text-4xl drop-shadow-md z-10">{equipped.eyes}</div>
      )}
      {equipped.hand && (
        <div className="absolute bottom-4 right-0 text-5xl drop-shadow-lg rotate-12">{equipped.hand}</div>
      )}
      {equipped.body && (
        <div className="absolute bottom-0 left-0 text-4xl drop-shadow-lg">{equipped.body}</div>
      )}
    </div>
  );
}

