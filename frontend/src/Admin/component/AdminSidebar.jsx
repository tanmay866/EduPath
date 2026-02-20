import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Map,
  LineChart,
  Settings,
} from 'lucide-react';

const AdminSidebar = () => {
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
    <aside className="w-64 h-screen bg-gray-900 text-gray-200 flex flex-col">
      {/* Top Section */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold">EduPath Admin</h1>
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
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
    </aside>
  );
};

export default AdminSidebar;
