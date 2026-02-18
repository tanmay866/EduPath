import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { updateSettings } from '../../Pages/Services/profileService';

const Settings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'Eng'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = () => {
    const theme = sessionStorage.getItem('theme') || 'light';
    const language = sessionStorage.getItem('language') || 'Eng';
    
    setSettings({ theme, language });
  };

  const handleChange = async (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    
    // Auto-save on change
    try {
      setLoading(true);
      const response = await updateSettings({
        [field]: value
      });
      
      if (response.success) {
        sessionStorage.setItem(field, value);
        setMessage('Settings updated!');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-11/12 max-w-md relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Theme Setting */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <label className="text-gray-700 font-medium text-sm">Theme</label>
            <div className="relative min-w-[120px]">
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                disabled={loading}
                className="w-full appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <ChevronDown size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Language Setting */}
          <div className="flex justify-between items-center py-4">
            <label className="text-gray-700 font-medium text-sm">Language</label>
            <div className="relative min-w-[120px]">
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                disabled={loading}
                className="w-full appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
              >
                <option value="Eng">English</option>
                <option value="Esp">Spanish</option>
                <option value="Fra">French</option>
                <option value="Ger">German</option>
              </select>
              <ChevronDown size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mt-4 bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm text-center">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
