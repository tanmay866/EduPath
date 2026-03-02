import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings as SettingsIcon, Save, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { updateSettings, changePassword } from '../Services/profileService';

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
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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

    try {
      const response = await changePassword(passwordData);
      if (response.success) {
        // Update token in sessionStorage
        if (response.token) {
          sessionStorage.setItem('token', response.token);
        }
        setPasswordMessage(response.message || 'Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordMessage(''), 3000);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
      setTimeout(() => setPasswordError(''), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 relative">
      {/* Live Moving Background Animations */}
      <div className="animated-bg">
        {/* Moving Shapes */}
        <div className="moving-shape shape-1"></div>
        <div className="moving-shape shape-2"></div>
        <div className="moving-shape shape-3"></div>
        <div className="moving-shape shape-4"></div>
        <div className="moving-shape shape-5"></div>
        <div className="moving-shape shape-6"></div>
        <div className="moving-shape shape-7"></div>
        <div className="moving-shape shape-8"></div>

        {/* Rotating Center Gradient */}
        <div className="rotating-gradient"></div>

        {/* Floating Particles */}
        <div className="floating-particle" style={{ top: '5%', left: '15%', animationDelay: '0s' }}></div>
        <div className="floating-particle" style={{ top: '8%', left: '85%', animationDelay: '2s' }}></div>
        <div className="floating-particle" style={{ top: '12%', left: '50%', animationDelay: '1.5s' }}></div>
        <div className="floating-particle" style={{ top: '15%', left: '20%', animationDelay: '0s' }}></div>
        <div className="floating-particle" style={{ top: '25%', left: '70%', animationDelay: '1s' }}></div>
        <div className="floating-particle" style={{ top: '45%', left: '10%', animationDelay: '2s' }}></div>
        <div className="floating-particle" style={{ top: '55%', left: '85%', animationDelay: '1.5s' }}></div>
        <div className="floating-particle" style={{ top: '75%', left: '30%', animationDelay: '0.5s' }}></div>
        <div className="floating-particle" style={{ top: '65%', left: '60%', animationDelay: '2.5s' }}></div>
        <div className="floating-particle" style={{ top: '35%', left: '50%', animationDelay: '3s' }}></div>
        <div className="floating-particle" style={{ top: '85%', left: '75%', animationDelay: '1.2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 backdrop-blur-lg bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-white/20"
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
          <div className="mb-6 backdrop-blur-lg bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 backdrop-blur-lg bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Main Settings Grid - Preferences and Password Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Preferences Card */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-8 border border-white/10 h-full shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 backdrop-blur-lg bg-purple-500/30 rounded-xl flex items-center justify-center border border-purple-400/30">
                <SettingsIcon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Preferences</h3>
                <p className="text-gray-400 text-sm">Customize your experience</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Theme Setting */}
              <div className="flex items-center justify-between py-4 border-b border-white/10">
                <div>
                  <label className="text-base font-medium text-white">Theme</label>
                  <p className="text-sm text-gray-400 mt-1">Choose your preferred theme</p>
                </div>
                <div className="relative min-w-[160px]">
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingsChange('theme', e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="light" className="bg-black text-white">Light</option>
                    <option value="dark" className="bg-black text-white">Dark</option>
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Language Setting */}
              <div className="flex items-center justify-between py-4 border-b border-white/10">
                <div>
                  <label className="text-base font-medium text-white">Language</label>
                  <p className="text-sm text-gray-400 mt-1">Select your language</p>
                </div>
                <div className="relative min-w-[160px]">
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingsChange('language', e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="Eng" className="bg-black text-white">English</option>
                    <option value="Esp" className="bg-black text-white">Spanish</option>
                    <option value="Fra" className="bg-black text-white">French</option>
                    <option value="Ger" className="bg-black text-white">German</option>
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
                  <div className="w-14 h-7 backdrop-blur-lg bg-white/10 border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-500/40 peer-checked:border-purple-400/50"></div>
                </label>
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3.5 backdrop-blur-lg bg-purple-500/30 hover:bg-purple-500/40 text-white font-semibold rounded-xl transition-all disabled:bg-gray-600/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base border border-purple-400/50 hover:border-purple-400/70 hover:shadow-xl hover:shadow-purple-500/50"
                >
                  <Save size={20} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-8 border border-white/10 h-full shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 backdrop-blur-lg bg-indigo-500/30 rounded-xl flex items-center justify-center border border-indigo-400/30">
                <Lock size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Change Password</h3>
                <p className="text-gray-400 text-sm">Update your account password</p>
              </div>
            </div>

            {/* Password Messages */}
            {passwordMessage && (
              <div className="mb-6 backdrop-blur-lg bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl font-medium">
                {passwordMessage}
              </div>
            )}
            {passwordError && (
              <div className="mb-6 backdrop-blur-lg bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl font-medium">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-11 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(p => !p)} tabIndex={-1}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors">
                    {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-11 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all"
                    placeholder="Enter new password"
                  />
                  <button type="button" onClick={() => setShowNewPw(p => !p)} tabIndex={-1}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors">
                    {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-11 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all"
                    placeholder="Confirm new password"
                  />
                  <button type="button" onClick={() => setShowConfirmPw(p => !p)} tabIndex={-1}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors">
                    {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Change Password Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full md:w-auto px-8 py-3.5 backdrop-blur-lg bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold rounded-xl transition-all disabled:bg-gray-600/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base border border-indigo-400/50 hover:border-indigo-400/70 hover:shadow-xl hover:shadow-indigo-500/50"
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
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all shadow-lg">
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
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all shadow-lg">
            <h4 className="text-lg font-semibold text-white mb-2">Privacy</h4>
            <p className="text-gray-400 text-sm mb-4">Control your privacy settings</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Coming Soon
            </button>
          </div>

          {/* Security Settings */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-6 border border-white/10 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/20 transition-all shadow-lg">
            <h4 className="text-lg font-semibold text-white mb-2">Security</h4>
            <p className="text-gray-400 text-sm mb-4">Password changed successfully</p>
            <button className="text-green-400 text-sm font-medium">
              ✓ Password Settings Active
            </button>
          </div>

          {/* Help & Support */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all shadow-lg">
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
