import React, { useState } from 'react';
import AdminSidebar from '../component/AdminSidebar';
import AdminNavbar from '../component/AdminNavbar';
import BackgroundAnimation from '../../Pages/Assessment/AssesmentDashboard/components/BackgroundAnimation';

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
    <div className="flex h-screen bg-black relative overflow-hidden">
      <BackgroundAnimation />

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
          <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-100">Quiz Generation Settings</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Max Questions per Quiz
              </label>
              <input
                type="number"
                value={settings.maxQuestions}
                onChange={(e) => handleInputChange('maxQuestions', parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 text-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="bg-white/5 border border-white/10 text-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Roadmap Generation Settings */}
          <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-100">Roadmap Generation Settings</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Max Modules per Roadmap
              </label>
              <input
                type="number"
                value={settings.maxModules}
                onChange={(e) => handleInputChange('maxModules', parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 text-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Default Roadmap Level
              </label>
              <select
                value={settings.defaultLevel}
                onChange={(e) => handleInputChange('defaultLevel', e.target.value)}
                className="bg-white/5 border border-white/10 text-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Section 3: AI Control Settings */}
          <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6 space-y-4">
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
                className="bg-white/5 border border-white/10 text-gray-200 rounded-lg px-4 py-2 w-full min-h-30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
