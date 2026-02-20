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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="w-full h-19 bg-gray-900 border-b border-gray-800 shadow-sm px-6 flex items-center justify-between">
      {/* Left Section - Dynamic Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-white">{currentTitle}</h1>
      </div>

      {/* Right Section - Admin Info & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;