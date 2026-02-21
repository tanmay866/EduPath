import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Map,
  LineChart,
  Settings,
  LogOut,
} from 'lucide-react';

const AdminSidebar = () => {
  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/';
  };

  const navItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'Users',
    },
    {
      path: '/admin/quiz-attempts',
      icon: ClipboardList,
      label: 'Quiz Attempts',
    },
    {
      path: '/admin/roadmaps',
      icon: Map,
      label: 'Roadmap History',
    },
    {
      path: '/admin/analytics',
      icon: LineChart,
      label: 'AI Analytics',
    },
    {
      path: '/admin/settings',
      icon: Settings,
      label: 'System Settings',
    },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900/85 backdrop-blur-xl text-gray-200 flex flex-col relative z-10 border-r border-white/10">
      {/* Top Section */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-semibold text-white">EduPath Admin</h1>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/80 backdrop-blur-md border border-red-400/30 text-white hover:bg-red-600/90 hover:border-red-400/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
