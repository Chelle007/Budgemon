'use client';

import { 
  ArrowLeft, 
  HelpCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  VolumeX, 
  Moon, 
  Smartphone, 
  Layers, 
  ChevronRight 
} from 'lucide-react';

// Helper component for the list items
const ProfileItem = ({ icon: Icon, title, subtitle, actionType = 'nav', isToggled = false }) => {
  return (
    <div className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 rounded-xl transition-colors">
      <div className="flex items-center gap-4">
        {/* Icon Container */}
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
          <Icon size={20} className="text-white" />
        </div>
        
        {/* Text Content */}
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800">{title}</span>
          <span className="text-xs text-gray-500">{subtitle}</span>
        </div>
      </div>

      {/* Right Action */}
      <div>
        {actionType === 'nav' && (
          <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        )}
        
        {actionType === 'toggle' && (
          <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ${isToggled ? 'bg-gray-900' : 'bg-gray-200'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isToggled ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProfileView({ onClose }) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Help">
          <HelpCircle size={20} className="text-gray-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {/* User Profile Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
              {/* Placeholder for user image */}
              <img 
                src="profile.jpg" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Chloe Lee Hae Eun</h1>
              <p className="text-sm text-gray-500">@chloelovesyall</p>
            </div>
          </div>
        </div>

        {/* Section: About Me */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">About Me</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              <ProfileItem 
                icon={User} 
                title="@chloelovesyall" 
                subtitle="Username" 
              />
              <ProfileItem 
                icon={Mail} 
                title="haeeunlee2005@gmail.com" 
                subtitle="E-mail Address" 
              />
              <ProfileItem 
                icon={Phone} 
                title="+6512345678" 
                subtitle="Phone Number" 
              />
              <ProfileItem 
                icon={MapPin} 
                title="Singapore" 
                subtitle="Address" 
              />
            </div>
          </div>
        </div>

        {/* Section: Settings */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Settings</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              <ProfileItem 
                icon={Globe} 
                title="English" 
                subtitle="Language" 
              />
              <ProfileItem 
                icon={VolumeX} 
                title="Silent Mode" 
                subtitle="Notifications & Message"
                actionType="toggle"
                isToggled={true}
              />
              <ProfileItem 
                icon={Moon} 
                title="Dark Mode" 
                subtitle="Theme"
                actionType="toggle"
                isToggled={true}
              />
              <ProfileItem 
                icon={Smartphone} 
                title="Camera, Location, & Microphone" 
                subtitle="Device Permissions" 
              />
              <ProfileItem 
                icon={Layers} 
                title="Manage Your Plan" 
                subtitle="Upgrade to Pro now." 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}