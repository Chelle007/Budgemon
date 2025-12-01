'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, BadgeDollarSign } from 'lucide-react';
import Image from 'next/image';

export default function CompanionView({
  petType,
  gameCurrency,
  onOpenShop,
  onOpenProfile,
  messages,
  chatEndRef,
  inputText,
  setInputText,
  onSendMessage,
  accentColorClass,
  equipped,
}) {
  const [speechBubble, setSpeechBubble] = useState({ text: '', visible: false, opacity: 0 });
  const [isTalking, setIsTalking] = useState(false);
  const speechTimeoutRef = useRef(null);
  const fadeTimeoutRef = useRef(null);
  const talkingTimeoutRef = useRef(null);
  const bubbleShowTimeoutRef = useRef(null);
  const previousMessagesLengthRef = useRef(messages.length);

  const presetMessage = (text) => {
    onSendMessage(text);
  };

  const petName = petType === 'lumi' ? 'Lumi' : 'Luna';
  const petImage = petType === 'lumi' ? '/lumi.png' : '/luna.png';
  const petTalkGif = petType === 'lumi' ? '/lumi-talk.gif' : '/lumi-talk.gif'; // Using lumi-talk.gif for now, can add luna-talk.gif later if needed

  // Watch for new bot messages and show speech bubble
  useEffect(() => {
    // Check if a new bot message was added
    if (messages.length > previousMessagesLengthRef.current) {
      const lastMessage = messages[messages.length - 1];
      
      // Only show speech bubble for bot messages
      if (lastMessage && lastMessage.sender === 'bot') {
        // Clear any existing timeouts
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
        if (talkingTimeoutRef.current) {
          clearTimeout(talkingTimeoutRef.current);
        }
        if (bubbleShowTimeoutRef.current) {
          clearTimeout(bubbleShowTimeoutRef.current);
        }

        // Show the talking GIF animation immediately
        setIsTalking(true);

        // Initialize speech bubble as invisible (will fade in at 2 seconds)
        setSpeechBubble({ text: lastMessage.text, visible: true, opacity: 0 });

        // Show speech bubble with fade-in at 2 seconds
        bubbleShowTimeoutRef.current = setTimeout(() => {
          setSpeechBubble((prev) => ({ ...prev, opacity: 1 }));
        }, 2000);

        // Switch back to static image after 5 seconds (let GIF play fully)
        talkingTimeoutRef.current = setTimeout(() => {
          setIsTalking(false);
        }, 5000);

        // Start fading out speech bubble after 6.5 seconds (after talking animation ends)
        speechTimeoutRef.current = setTimeout(() => {
          setSpeechBubble((prev) => ({ ...prev, opacity: 0 }));
          
          // Hide completely after fade animation
          fadeTimeoutRef.current = setTimeout(() => {
            setSpeechBubble({ text: '', visible: false, opacity: 0 });
          }, 500); // Match the transition duration
        }, 6500);
      }
    }
    
    previousMessagesLengthRef.current = messages.length;

    // Cleanup on unmount
    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
      }
      if (bubbleShowTimeoutRef.current) {
        clearTimeout(bubbleShowTimeoutRef.current);
      }
    };
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
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

      <div className="flex-1 flex flex-col items-center justify-end relative px-4 pb-8">
        {/* Speech Bubble - positioned above pet image */}
        {speechBubble.visible && (
          <div
            className="absolute bottom-[280px] z-20 max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-lg bg-white text-gray-800 border border-gray-100 transition-opacity duration-500"
            style={{ opacity: speechBubble.opacity }}
          >
            {speechBubble.text}
          </div>
        )}

        {/* Pet Image */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {isTalking ? (
            <Image
              src={petTalkGif}
              alt={`${petName} talking`}
              width={256}
              height={256}
              className="object-contain"
              unoptimized
            />
          ) : (
            <Image
              src={petImage}
              alt={petName}
              width={256}
              height={256}
              className="object-contain"
              priority
            />
          )}
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => presetMessage('Bought Coffee $6')}
            className="flex-shrink-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm whitespace-nowrap active:scale-95 transition"
          >
            ☕ Coffee $6
          </button>
          <button
            onClick={() => presetMessage('Transport $2')}
            className="flex-shrink-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm whitespace-nowrap active:scale-95 transition"
          >
            🚆 Train $2
          </button>
          <button
            onClick={() => presetMessage('Lunch $12')}
            className="flex-shrink-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm whitespace-nowrap active:scale-95 transition"
          >
            🍜 Lunch $12
          </button>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-100 pb-20 md:pb-4">
        <div className="flex gap-2 bg-gray-50 p-2 rounded-full border border-gray-200">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Type 'Spent $12 on...'"
            className="flex-1 bg-transparent px-4 outline-none text-gray-700"
          />
          <button
            onClick={() => onSendMessage()}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition active:scale-90 ${accentColorClass}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

