'use client';

import { ArrowLeft, BadgeDollarSign } from 'lucide-react';
import Image from 'next/image';

// Wardrobe items mapping
const WARDROBE_ITEMS = [
  { id: 'ribbon', name: 'Ribbon', price: 8, image: '/wardrobe/ribbon.png', lumiImage: '/wardrobe/lumi-ribbon.png', category: 'head' },
  { id: 'hat', name: 'Santa Hat', price: 12, image: '/wardrobe/hat.png', lumiImage: '/wardrobe/lumi-hat.png', category: 'head' },
  { id: 'mustache', name: 'Mustache', price: 10, image: '/wardrobe/mustache.png', lumiImage: '/wardrobe/lumi-mustache.png', category: 'face' },
  { id: 'hat2', name: 'Mexican Hat', price: 10, image: '/wardrobe/hat2.png', lumiImage: null, category: 'head' },
  { id: 'hat3', name: 'Fez Hat', price: 11, image: '/wardrobe/hat3.png', lumiImage: null, category: 'head' },
  { id: 'sunglasses', name: 'Sunglasses', price: 15, image: '/wardrobe/sunglasses.png', lumiImage: null, category: 'eyes' },
];

export default function ShopView({
  onClose,
  gameCurrency,
  petType,
  inventory,
  onBuyItem,
  onEquipItem,
  items,
  equipped,
}) {
  // Determine which lumi image to show based on equipped items
  const getLumiImage = () => {
    if (!equipped) {
      return '/wardrobe/lumi-none.png';
    }

    const hasHat = equipped.head && (equipped.head === 'hat' || equipped.head === '🧢' || equipped.head === 'Beige Hat');
    const hasMustache = equipped.face && (equipped.face === 'mustache' || equipped.face === 'Mustache');
    const hasRibbon = equipped.head && (equipped.head === 'ribbon' || equipped.head === '🎀');

    // Check for combinations first (hat + mustache)
    if (hasHat && hasMustache) {
      return '/wardrobe/lumi-hat-mustache.png';
    }

    // Then check individual items
    if (hasHat) {
      return '/wardrobe/lumi-hat.png';
    }
    if (hasRibbon) {
      return '/wardrobe/lumi-ribbon.png';
    }
    if (hasMustache) {
      return '/wardrobe/lumi-mustache.png';
    }

    // If no matching wardrobe item is equipped, show lumi-none.png
    return '/wardrobe/lumi-none.png';
  };

  const lumiImageSrc = getLumiImage();

  // Filter wardrobe items for display
  const wardrobeItems = WARDROBE_ITEMS;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Pet Shop</h1>
        </div>
        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
          <BadgeDollarSign size={16} className="text-yellow-800" />
          <span className="font-bold text-yellow-800">{gameCurrency}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 flex items-center justify-center">
        {/* Work in Progress Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <BadgeDollarSign size={32} className="text-yellow-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Stay Tuned!</h2>
          <p className="text-gray-600 mb-4">The shop is currently under construction.</p>
          <p className="text-sm text-gray-500">We're working hard to bring you amazing items soon!</p>
        </div>
      </div>
    </div>
  );
}

