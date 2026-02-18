import React, { useState, useRef, useEffect } from 'react';
import { HiHome, HiUser, HiCode, HiMail, HiX, HiMenu } from 'react-icons/hi';
import { FaUser, FaSignOutAlt, FaCog, FaBell } from "react-icons/fa";
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArcNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();

  const isEmail = sessionStorage.getItem("email");
  const firstName = sessionStorage.getItem("firstName");
  const lastName = sessionStorage.getItem("lastName");
  const profilePicture = sessionStorage.getItem("profilePicture");

  const [open,setOpen] = useState(false);

  const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : 'U';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'User';

  

  const handleLogout = () => {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (confirmLogout) {
        sessionStorage.clear();
        navigate('/');
        window.location.reload();
      }
    }

  const navItems = [
    { icon: <HiHome />, label: 'Home', path: '/' },
    { icon: <HiUser />, label: 'About', path: '/about' },
    { icon: <HiCode />, label: 'Assessment', path: '/assessment' },
    { icon: <HiMail />, label: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={navRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-8 left-8 z-[70] w-10 h-10 cursor-pointer flex items-center justify-center backdrop-blur-lg bg-indigo-500/30 text-white rounded-full border-2 border-indigo-400/50 shadow-xl hover:shadow-indigo-500/50 hover:bg-indigo-500/40 hover:scale-110 pointer-events-auto active:scale-95 transition-all"
      >
        {isOpen ? <HiX size={26} /> : <HiMenu size={26} />}
      </button>

      {/* Horizontal Gradient Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="straightLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
          </linearGradient>
          <filter id="glassBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
          <filter id="glassGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Blurred background for glass depth */}
        <line
          x1="64" y1="52"
          x2="500" y2="52"
          stroke="url(#straightLineGradient)"
          strokeWidth="22"
          strokeLinecap="round"
          filter="url(#glassBlur)"
          className={`transition-all duration-1000 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{
            strokeDasharray: 500,
            strokeDashoffset: isOpen ? 0 : 500,
          }}
        />
        
        {/* Main gradient glass line */}
        <line
          x1="64" y1="52"
          x2="500" y2="52"
          stroke="url(#straightLineGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          filter="url(#glassGlow)"
          className={`transition-all duration-1000 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{
            strokeDasharray: 500,
            strokeDashoffset: isOpen ? 0 : 500,
          }}
        />
        
        {/* Glossy highlight */}
        <line
          x1="64" y1="52"
          x2="500" y2="52"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{
            strokeDasharray: 500,
            strokeDashoffset: isOpen ? 0 : 500,
          }}
        />
      </svg>

      {/* Navigation Items - Horizontal Animation */}
      {navItems.map((item, idx) => {
        const leftPosition = 64 + (idx + 1) * 100; // 64px base + 100px spacing per item
        
        return (
          <div
            key={idx}
            className={`absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
            style={{
              left: isOpen ? `${leftPosition}px` : '32px',
              top: '32px',
              opacity: isOpen ? 1 : 0,
              transitionDelay: isOpen ? `${idx * 80}ms` : '0ms',
            }}
          >
            <div className="group relative pointer-events-auto">
              <button
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center backdrop-blur-lg bg-indigo-500/30 text-white rounded-full border-2 border-indigo-400/50 shadow-xl hover:shadow-indigo-500/50 hover:bg-indigo-500/40 hover:scale-110 transition-all"
              >
                {item.icon}
              </button>
              
              <span className="absolute left-1/2 top-16 -translate-x-1/2 mt-2 px-4 py-2 backdrop-blur-lg bg-slate-800/40 text-white text-sm font-bold rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap border border-white/20 shadow-xl">
                {item.label}
              </span>
            </div>
          </div>
        );
      })}
     
      {/* sign up/sign in buttons */}
      <div className="absolute top-8 right-8 flex space-x-4 pointer-events-auto">
        {isEmail ? (
           <div className="relative">
      
      {/* Profile Circle */}
      <div
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-lg bg-indigo-500/30 border-2 border-indigo-400/50 text-white font-bold cursor-pointer overflow-hidden hover:bg-indigo-500/40 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/50 transition-all"
      >
        {profilePicture ? (
          <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          firstLetter
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 backdrop-blur-lg bg-slate-800/40 rounded-xl shadow-2xl py-2 border border-white/20 overflow-hidden animate-slideDown">
          {/* Profile Header */}
          <div className="px-4 py-3 backdrop-blur-sm bg-white/5 flex gap-3 items-center border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                firstLetter
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-white truncate">{fullName}</h4>
              <p className="text-xs text-slate-300 truncate">{isEmail}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                navigate('/profile');
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/10 transition-colors rounded-lg"
            >
              <FaUser className="text-slate-300" />
              <span className="flex-1 text-left text-sm font-medium">My Profile</span>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            <button
              onClick={() => {
                navigate('/settings');
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/10 transition-colors rounded-lg"
            >
              <FaCog className="text-slate-300" />
              <span className="flex-1 text-left text-sm font-medium">Settings</span>
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-1"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/20 transition-colors rounded-lg"
          >
            <FaSignOutAlt />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      )}
    </div>
        ) : (
         <div className="flex items-center gap-4">
           <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 backdrop-blur-lg bg-slate-700/30 text-gray-200 font-bold rounded-full border border-slate-400/30 hover:bg-slate-700/40 hover:border-slate-400/50 hover:shadow-lg transition-all cursor-pointer h-10 flex items-center"
          >
            Sign In
          </button>
          <button
          onClick={() => navigate('/signup')}
          className="px-4 py-2 backdrop-blur-lg bg-indigo-500/30 text-white font-bold rounded-full border border-indigo-400/50 hover:bg-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all cursor-pointer h-10 flex items-center"
        >
          Get Started
        </button>
         </div>
        )}
        
      </div>

    </div>
  );
};

export default ArcNavbar;