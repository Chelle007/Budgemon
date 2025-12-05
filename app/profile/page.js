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
  LogOut,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '../context/UserContext';

const EditableProfileItem = ({ 
  icon: Icon, 
  value, 
  subtitle, 
  fieldName,
  onSave,
  isEditing,
  onEdit,
  onCancel,
  disabled = false,
  displayPrefix = '',
  isDark = false
}) => {
  const [editValue, setEditValue] = useState(value === 'Not set' ? '' : value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditValue(value === 'Not set' ? '' : value);
  }, [value, isEditing]);

  const handleSave = async () => {
    const cleanValue = editValue.trim();
    if (cleanValue === (value === 'Not set' ? '' : value)) {
      onCancel();
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(fieldName, cleanValue);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value === 'Not set' ? '' : value);
    onCancel();
  };

  const displayValue = value === 'Not set' ? 'Not set' : `${displayPrefix}${value}`;

  if (isEditing) {
    return (
      <div className={`flex items-center justify-between py-4 px-4 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
            <Icon size={20} className="text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-1">
              {displayPrefix && <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{displayPrefix}</span>}
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className={`text-sm font-bold bg-transparent border-b-2 focus:outline-none pb-1 flex-1 ${isDark ? 'text-white border-gray-600 focus:border-white' : 'text-gray-900 border-gray-300 focus:border-gray-900'}`}
                autoFocus
                disabled={isSaving}
              />
            </div>
            <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600 transition disabled:opacity-50"
            aria-label="Save"
          >
            <Check size={16} className="text-white" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-50 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            aria-label="Cancel"
          >
            <X size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between py-4 px-4 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex flex-col flex-1">
          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{displayValue}</span>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</span>
        </div>
      </div>
      {!disabled && (
        <button
          onClick={onEdit}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          aria-label="Edit"
        >
          <Edit2 size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
        </button>
      )}
    </div>
  );
};

const ProfileItem = ({ icon: Icon, title, subtitle, actionType = 'nav', isToggled = false, isDark = false }) => {
  return (
    <div className={`flex items-center justify-between py-4 px-4 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</span>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</span>
        </div>
      </div>
      <div>
        {actionType === 'nav' && (
          <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <ChevronRight size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        )}
        {actionType === 'toggle' && (
          <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ${isToggled ? (isDark ? 'bg-gray-700' : 'bg-gray-900') : (isDark ? 'bg-gray-800' : 'bg-gray-200')}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isToggled ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading, handleLogout, darkMode, setDarkMode } = useUser();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

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

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageDropdown && !event.target.closest('[data-language-dropdown]')) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguageDropdown]);

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
        // Update dark mode in context
        if (setDarkMode) {
          setDarkMode(settingsData.dark_mode || false);
        }
      } else {
        // Create default settings if they don't exist
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            language: 'English',
            silent_mode: false,
            dark_mode: false,
            notifications_enabled: true,
          })
          .select()
          .single();

        if (newSettings && !createError) {
          setSettings(newSettings);
        }
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

  const handleSaveProfileField = async (fieldName, value) => {
    if (!user || !profile) return;

    try {
      const updateData = {
        [fieldName]: value.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setEditingField(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleUpdateSettings = async (fieldName, value) => {
    if (!user) return;

    try {
      // First ensure settings exist
      if (!settings) {
        const { data: newSettings } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            language: 'English',
            silent_mode: false,
            dark_mode: false,
            notifications_enabled: true,
            [fieldName]: value,
          })
          .select()
          .single();

        if (newSettings) {
          setSettings(newSettings);
          if (fieldName === 'dark_mode' && setDarkMode) {
            setDarkMode(value);
          }
        }
        return;
      }

      const updateData = {
        [fieldName]: value,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
        // Update dark mode in context if it's the dark_mode field
        if (fieldName === 'dark_mode' && setDarkMode) {
          setDarkMode(value);
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    }
  };

  const handleToggleSilentMode = () => {
    const newValue = !(settings?.silent_mode || false);
    handleUpdateSettings('silent_mode', newValue);
  };

  const handleToggleDarkMode = () => {
    const newValue = !(settings?.dark_mode || false);
    handleUpdateSettings('dark_mode', newValue);
  };

  const handleLanguageSelect = () => {
    // For now, just English, but we'll show a dropdown if needed in the future
    handleUpdateSettings('language', 'English');
    setShowLanguageDropdown(false);
  };

  const handleDevicePermissions = () => {
    setShowPermissionsModal(true);
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

  const isDark = darkMode || false;

  return (
    <div className={`font-sans max-w-md mx-auto h-screen shadow-2xl overflow-hidden ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
      <div className={`flex flex-col h-full ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className={`border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10 ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/app')}
              className={`p-2 rounded-full transition ${isDark ? 'hover:bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Profile</h1>
          </div>
          <button className={`p-2 rounded-full transition ${isDark ? 'hover:bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'}`} aria-label="Help">
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
          <div className={`p-6 rounded-2xl shadow-sm border mb-6 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 border flex items-center justify-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-200'}`}>
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                )}
              </div>
              <div className="flex-1">
                <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{displayName}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>@{username}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>About Me</h2>
            <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
              <div className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
                <EditableProfileItem
                  icon={User}
                  value={username || 'Not set'}
                  subtitle="Username"
                  fieldName="username"
                  onSave={(fieldName, value) => {
                    // Remove @ if user added it
                    const cleanValue = value.replace(/^@+/, '');
                    return handleSaveProfileField(fieldName, cleanValue);
                  }}
                  isEditing={editingField === 'username'}
                  onEdit={() => setEditingField('username')}
                  onCancel={() => setEditingField(null)}
                  displayPrefix="@"
                  isDark={isDark}
                />
                <EditableProfileItem
                  icon={Mail}
                  value={email || 'Not set'}
                  subtitle="E-mail Address"
                  fieldName="email"
                  onSave={handleSaveProfileField}
                  isEditing={editingField === 'email'}
                  onEdit={() => setEditingField('email')}
                  onCancel={() => setEditingField(null)}
                  isDark={isDark}
                />
                <EditableProfileItem
                  icon={Phone}
                  value={phone || 'Not set'}
                  subtitle="Phone Number"
                  fieldName="phone"
                  onSave={handleSaveProfileField}
                  isEditing={editingField === 'phone'}
                  onEdit={() => setEditingField('phone')}
                  onCancel={() => setEditingField(null)}
                  isDark={isDark}
                />
                <EditableProfileItem
                  icon={MapPin}
                  value={address || 'Not set'}
                  subtitle="Address"
                  fieldName="address"
                  onSave={handleSaveProfileField}
                  isEditing={editingField === 'address'}
                  onEdit={() => setEditingField('address')}
                  onCancel={() => setEditingField(null)}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Settings</h2>
            <div className={`rounded-2xl shadow-sm border overflow-hidden relative ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
              <div className="divide-y divide-gray-100">
                {/* Language - Clickable */}
                <div 
                  data-language-dropdown
                  className={`flex items-center justify-between py-4 px-4 rounded-xl transition-colors cursor-pointer relative ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
                      <Globe size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{settings?.language || 'English'}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Language</span>
                    </div>
                  </div>
                  <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <ChevronRight size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                  </button>
                  {showLanguageDropdown && (
                    <div className={`absolute top-full left-0 right-0 border rounded-xl shadow-lg z-10 mt-1 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLanguageSelect();
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center justify-between ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                      >
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>English</span>
                        {(settings?.language || 'English') === 'English' && (
                          <Check size={16} className={isDark ? 'text-white' : 'text-gray-900'} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Silent Mode - Toggle */}
                <div 
                  className={`flex items-center justify-between py-4 px-4 rounded-xl transition-colors cursor-pointer ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                  onClick={handleToggleSilentMode}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
                      <VolumeX size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Silent Mode</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Notifications & Message</span>
                    </div>
                  </div>
                  <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer ${settings?.silent_mode ? (isDark ? 'bg-gray-700' : 'bg-gray-900') : (isDark ? 'bg-gray-800' : 'bg-gray-200')}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${settings?.silent_mode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Dark Mode - Toggle */}
                <div 
                  className={`flex items-center justify-between py-4 px-4 rounded-xl transition-colors cursor-pointer ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                  onClick={handleToggleDarkMode}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
                      <Moon size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Dark Mode</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Theme</span>
                    </div>
                  </div>
                  <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer ${settings?.dark_mode ? (isDark ? 'bg-gray-700' : 'bg-gray-900') : (isDark ? 'bg-gray-800' : 'bg-gray-200')}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${settings?.dark_mode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Device Permissions - Clickable */}
                <div 
                  className={`flex items-center justify-between py-4 px-4 rounded-xl transition-colors cursor-pointer ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                  onClick={handleDevicePermissions}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
                      <Smartphone size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Camera, Location, & Microphone</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Device Permissions</span>
                    </div>
                  </div>
                  <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <ChevronRight size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                  </button>
                </div>

                {/* Manage Plan */}
                <ProfileItem icon={Layers} title="Manage Your Plan" subtitle="Upgrade to Pro now." isDark={isDark} />
              </div>
            </div>
          </div>

          {/* Permissions Modal */}
          {showPermissionsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`rounded-2xl p-6 max-w-sm w-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Device Permissions</h3>
                <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Please go to your settings to manage camera, location, and microphone permissions.</p>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className={`w-full py-3 font-semibold rounded-xl transition ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                >
                  OK
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleLogoutClick}
              className={`w-full border-2 font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 ${isDark ? 'bg-red-900 hover:bg-red-800 border-red-800 text-red-200' : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'}`}
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
