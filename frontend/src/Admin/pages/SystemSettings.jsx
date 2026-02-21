import React, { useState } from 'react';
import AdminSidebar from '../component/AdminSidebar';
import AdminNavbar from '../component/AdminNavbar';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    maxQuestions: 10,
    maxDuration: 30,
    maxModules: 8,
    defaultLevel: 'Beginner',
    enableAI: true,
    basePrompt: 'Generate structured JSON output only. No explanations.',
  });

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log('Settings:', settings);
  };

  return (
    <div className="flex h-screen bg-gray-950 relative overflow-hidden">
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
        <div className="floating-particle" style={{top: '5%', left: '15%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '8%', left: '85%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '12%', left: '50%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '15%', left: '20%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '25%', left: '70%', animationDelay: '1s'}}></div>
        <div className="floating-particle" style={{top: '45%', left: '10%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '55%', left: '85%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '75%', left: '30%', animationDelay: '0.5s'}}></div>
        <div className="floating-particle" style={{top: '65%', left: '60%', animationDelay: '2.5s'}}></div>
        <div className="floating-particle" style={{top: '35%', left: '50%', animationDelay: '3s'}}></div>
        <div className="floating-particle" style={{top: '85%', left: '75%', animationDelay: '1.2s'}}></div>
      </div>

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">System Settings</h1>
            <p className="text-sm text-gray-400 mt-1">
              Configure AI generation limits and platform controls.
            </p>
          </div>

          {/* Section 1: Quiz Generation Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-100">Quiz Generation Settings</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Max Questions per Quiz
              </label>
              <input
                type="number"
                value={settings.maxQuestions}
                onChange={(e) => handleInputChange('maxQuestions', parseInt(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Max Quiz Duration (minutes)
              </label>
              <input
                type="number"
                value={settings.maxDuration}
                onChange={(e) => handleInputChange('maxDuration', parseInt(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Roadmap Generation Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-100">Roadmap Generation Settings</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Max Modules per Roadmap
              </label>
              <input
                type="number"
                value={settings.maxModules}
                onChange={(e) => handleInputChange('maxModules', parseInt(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Default Roadmap Level
              </label>
              <select
                value={settings.defaultLevel}
                onChange={(e) => handleInputChange('defaultLevel', e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Section 3: AI Control Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-100">AI Control Settings</h2>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-400">Enable AI Generation</label>
              </div>
              <button
                onClick={() => handleInputChange('enableAI', !settings.enableAI)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableAI ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableAI ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Base Prompt Template
              </label>
              <textarea
                value={settings.basePrompt}
                onChange={(e) => handleInputChange('basePrompt', e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 w-full min-h-30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
            >
              Save Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemSettings;