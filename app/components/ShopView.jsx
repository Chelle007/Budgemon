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

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {/* Lumi preview at the top */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="relative w-48 h-48">
              <Image
                src={lumiImageSrc}
                alt="Lumi"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Wardrobe items grid */}
        <div className="grid grid-cols-2 gap-4">
          {wardrobeItems.map((item) => {
            const isOwned = inventory.includes(item.id);
            // Check if this item is currently equipped
            let isEquipped = false;
            if (equipped) {
              if (item.id === 'hat' && equipped.head && (equipped.head === 'hat' || equipped.head === '🧢' || equipped.head === 'Beige Hat')) {
                isEquipped = true;
              } else if (item.id === 'ribbon' && equipped.head && (equipped.head === 'ribbon' || equipped.head === '🎀')) {
                isEquipped = true;
              } else if (item.id === 'mustache' && equipped.face && (equipped.face === 'mustache' || equipped.face === 'Mustache')) {
                isEquipped = true;
              } else if (item.id === 'sunglasses' && equipped.eyes && (equipped.eyes === 'sunglasses' || equipped.eyes === '🕶️' || equipped.eyes === 'Sunglasses')) {
                isEquipped = true;
              }
            }

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border flex flex-col items-center gap-2 hover:shadow-md transition ${
                  isEquipped ? 'border-green-500 border-2' : 'border-gray-100'
                }`}
              >
                <div className="w-20 h-20 relative mb-2">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="font-bold text-gray-800">{item.name}</h4>
                {isOwned ? (
                  <button
                    onClick={() => {
                      if (isEquipped) {
                        // Unequip by setting the category to null
                        onEquipItem({ id: item.id, name: item.name, category: item.category, icon: null });
                      } else {
                        // Equip the item
                        onEquipItem({ id: item.id, name: item.name, category: item.category, icon: item.id });
                      }
                    }}
                    className={`w-full py-2 rounded-xl text-sm font-bold ${
                      isEquipped
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {isEquipped ? 'Unequip' : 'Equip'}
                  </button>
                ) : (
                  <button
                    onClick={() => onBuyItem({ id: item.id, name: item.name, price: item.price, category: item.category, icon: item.id })}
                    className="w-full py-2 bg-yellow-500 text-white rounded-xl text-sm font-bold shadow-yellow-200 hover:bg-yellow-600"
                  >
                    Buy ${item.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

