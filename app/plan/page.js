'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function PlanPage() {
  const router = useRouter();
  const { darkMode } = useUser();
  const [showPopup, setShowPopup] = useState(false);
  const isDark = darkMode || false;

  const handleGetProPlan = () => {
    setShowPopup(true);
  };

  const handleNoThanks = () => {
    router.push('/profile');
  };

  return (
    <div className={`font-sans max-w-md mx-auto h-screen shadow-2xl overflow-hidden ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
      <div className={`flex flex-col h-full ${isDark ? 'bg-black' : 'bg-white'}`}>
        {/* Header */}
        <div className={`border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10 ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
          <button
            onClick={() => router.push('/profile')}
            className={`p-2 rounded-full transition ${isDark ? 'hover:bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Manage Plan</h1>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {/* Main Title */}
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Upgrade to Pro Plan Now!
          </h2>

          {/* Plan Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Free Plan */}
            <div className={`rounded-2xl border-2 p-6 flex flex-col ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Free Plan</h3>
              <div className="flex-1 space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <X size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Manual Input and Chat</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Pet gets tired, limited time for pet</span>
                </div>
                <div className="flex items-start gap-2">
                  <X size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Limited to Max 5 Friends</span>
                </div>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$0/month</div>
            </div>

            {/* Pro Plan */}
            <div className={`rounded-2xl border-2 p-6 flex flex-col ${isDark ? 'bg-gray-900 border-blue-500' : 'bg-white border-blue-500'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Pro Plan</h3>
              <div className="flex-1 space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Auto-Sync with Bank Cards</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>5x more chat tokens/interaction</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Increased to Max 20 Friends</span>
                </div>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$6.99/month</div>
            </div>
          </div>

          {/* Free Trial Offer */}
          <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-800' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'}`}>
            <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Free Trial for 1 Month!</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Upgrade today and enjoy your <span className="font-bold">first month for free</span>. This offer is available for a limited time only!
            </p>
          </div>

          {/* Call to Action */}
          <div className="space-y-3">
            <button
              onClick={handleGetProPlan}
              className={`w-full py-4 rounded-2xl font-bold text-white transition transform active:scale-95 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 hover:bg-gray-800'}`}
            >
              Get My Pro Plan
            </button>
            <button
              onClick={handleNoThanks}
              className={`w-full text-center text-sm transition ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              No thanks
            </button>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-sm w-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Stay Tuned!</h3>
              <button
                onClick={() => setShowPopup(false)}
                className={`p-1 rounded-full transition ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We are still working on this! Stay tuned for updates.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className={`w-full py-3 font-semibold rounded-xl transition ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

