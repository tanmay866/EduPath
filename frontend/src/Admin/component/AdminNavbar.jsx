import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeTitleMap = {
    '/admin/dashboard': 'Dashboard',
    '/admin/users': 'Manage Users',
    '/admin/quiz-attempts': 'Quiz Attempts',
    '/admin/roadmaps': 'Roadmap History',
    '/admin/analytics': 'AI Analytics',
    '/admin/settings': 'System Settings',
  };

  const currentTitle = routeTitleMap[location.pathname] || 'Dashboard';

  return (
    <header className="w-full h-19 backdrop-blur-xl bg-black/60 border-b border-white/10 shadow-lg px-6 flex items-center justify-between">
      {/* Left Section - Dynamic Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-white">{currentTitle}</h1>
      </div>

      {/* Right Section - Admin Info */}
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
        <span className="text-sm font-medium text-white">Admin</span>
      </div>
    </header>
  );
};

export default AdminNavbar;