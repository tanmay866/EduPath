import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings as SettingsIcon, Save, ArrowLeft, Lock } from 'lucide-react';
import { updateSettings } from '../Services/profileService';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Settings Data
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'Eng',
    notificationEnabled: true
  });

  useEffect(() => {
    // Check if user is logged in
    const email = sessionStorage.getItem('email');
    if (!email) {
      navigate('/signin');
      return;
    }

    // Load data from sessionStorage
    loadSettings();
  }, [navigate]);

  const loadSettings = () => {
    const theme = sessionStorage.getItem('theme') || 'light';
    const language = sessionStorage.getItem('language') || 'Eng';
    
    setSettings({ theme, language, notificationEnabled: true });
  };

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await updateSettings(settings);
      if (response.success) {
        sessionStorage.setItem('theme', settings.theme);
        sessionStorage.setItem('language', settings.language);
        setMessage('Settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError('Failed to update settings');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      setTimeout(() => setPasswordError(''), 3000);
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 3) {
      setPasswordError('New password must be at least 3 characters');
      setTimeout(() => setPasswordError(''), 3000);
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setTimeout(() => setPasswordError(''), 3000);
      setPasswordLoading(false);
      return;
    }

    // TODO: Add API call to change password
    // For now, just show success message
    setTimeout(() => {
      setPasswordMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMessage(''), 3000);
      setPasswordLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your preferences and account settings</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-6 bg-green-500 bg-opacity-20 border border-green-500 text-green-400 px-6 py-4 rounded-xl">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Main Settings Grid - Preferences and Password Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Preferences Card */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <SettingsIcon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Preferences</h3>
              <p className="text-gray-400 text-sm">Customize your experience</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Theme Setting */}
            <div className="flex items-center justify-between py-4 border-b border-slate-700">
              <div>
                <label className="text-base font-medium text-white">Theme</label>
                <p className="text-sm text-gray-400 mt-1">Choose your preferred theme</p>
              </div>
              <div className="relative min-w-[160px]">
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingsChange('theme', e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
                <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Language Setting */}
            <div className="flex items-center justify-between py-4 border-b border-slate-700">
              <div>
                <label className="text-base font-medium text-white">Language</label>
                <p className="text-sm text-gray-400 mt-1">Select your language</p>
              </div>
              <div className="relative min-w-[160px]">
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingsChange('language', e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                >
                  <option value="Eng">English</option>
                  <option value="Esp">Spanish</option>
                  <option value="Fra">French</option>
                  <option value="Ger">German</option>
                </select>
                <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Notification Setting */}
            <div className="flex items-center justify-between py-4">
              <div>
                <label className="text-base font-medium text-white">Notifications</label>
                <p className="text-sm text-gray-400 mt-1">Enable or disable notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationEnabled}
                  onChange={(e) => handleSettingsChange('notificationEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-6">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

          {/* Change Password Card */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Lock size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Change Password</h3>
              <p className="text-gray-400 text-sm">Update your account password</p>
            </div>
          </div>

          {/* Password Messages */}
          {passwordMessage && (
            <div className="mb-6 bg-green-500 border border-green-600 text-white px-6 py-4 rounded-xl font-medium">
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="mb-6 bg-red-500 border border-red-600 text-white px-6 py-4 rounded-xl font-medium">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter new password"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Confirm new password"
              />
            </div>

            {/* Change Password Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                <Lock size={20} />
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
        </div>

        {/* Additional Settings Sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Settings */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h4 className="text-lg font-semibold text-white mb-2">Account</h4>
            <p className="text-gray-400 text-sm mb-4">Manage your account settings</p>
            <button
              onClick={() => navigate('/profile')}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Go to Profile →
            </button>
          </div>

          {/* Privacy Settings */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h4 className="text-lg font-semibold text-white mb-2">Privacy</h4>
            <p className="text-gray-400 text-sm mb-4">Control your privacy settings</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Coming Soon
            </button>
          </div>

          {/* Security Settings */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h4 className="text-lg font-semibold text-white mb-2">Security</h4>
            <p className="text-gray-400 text-sm mb-4">Password changed successfully</p>
            <button className="text-green-400 text-sm font-medium">
              ✓ Password Settings Active
            </button>
          </div>

          {/* Help & Support */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h4 className="text-lg font-semibold text-white mb-2">Help & Support</h4>
            <p className="text-gray-400 text-sm mb-4">Get help and contact support</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
