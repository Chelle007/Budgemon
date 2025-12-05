'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ChevronRight,
  LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '../context/UserContext';

const ProfileItem = ({ icon: Icon, title, subtitle, actionType = 'nav', isToggled = false }) => {
  return (
    <div className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 rounded-xl transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800">{title}</span>
          <span className="text-xs text-gray-500">{subtitle}</span>
        </div>
      </div>
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading, handleLogout } = useUser();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData && !profileError) {
        setProfile(profileData);
      } else {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            username: user.email?.split('@')[0] || '',
          })
          .select()
          .single();

        if (newProfile && !createError) {
          setProfile(newProfile);
        }
      }

      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsData && !settingsError) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    if (confirm('Are you sure you want to log out?')) {
      handleLogout();
    }
  };

  if (userLoading || loading) {
    return (
      <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const username = profile?.username || user?.email?.split('@')[0] || '';
  const email = profile?.email || user?.email || '';
  const phone = profile?.phone || 'Not set';
  const address = profile?.address || 'Not set';

  return (
    <div className="font-sans max-w-md mx-auto h-screen bg-gray-100 shadow-2xl overflow-hidden">
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/app')}
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 shrink-0 border border-gray-200 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{displayName}</h1>
                <p className="text-sm text-gray-500">@{username}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">About Me</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                <ProfileItem icon={User} title={`@${username}`} subtitle="Username" />
                <ProfileItem icon={Mail} title={email} subtitle="E-mail Address" />
                <ProfileItem icon={Phone} title={phone} subtitle="Phone Number" />
                <ProfileItem icon={MapPin} title={address} subtitle="Address" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Settings</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                <ProfileItem icon={Globe} title={settings?.language || 'English'} subtitle="Language" />
                <ProfileItem icon={VolumeX} title="Silent Mode" subtitle="Notifications & Message" actionType="toggle" isToggled={settings?.silent_mode || false} />
                <ProfileItem icon={Moon} title="Dark Mode" subtitle="Theme" actionType="toggle" isToggled={settings?.dark_mode || false} />
                <ProfileItem icon={Smartphone} title="Camera, Location, & Microphone" subtitle="Device Permissions" />
                <ProfileItem icon={Layers} title="Manage Your Plan" subtitle="Upgrade to Pro now." />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleLogoutClick}
              className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
