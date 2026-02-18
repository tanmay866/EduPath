import React, { useState, useRef, useEffect } from 'react';
import { HiHome, HiUser, HiCode, HiMail, HiX, HiMenu } from 'react-icons/hi';
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const ArcNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();

  const isEmail = sessionStorage.getItem("email");
  const firstName = sessionStorage.getItem("firstName");


  const [open,setOpen] = useState(false); 

  const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  

  const handleLogout = () => {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (confirmLogout) {
        sessionStorage.clear();
        navigate('/');
        window.location.reload();
      }
    }

  // COORDINATE CONFIGURATION (Adjust these to tweak the curve)
  // P0 = Start (Button), P1 = Control Point (Bends the curve), P2 = End
  const P0 = { x: 64, y: 64 };
  const P1 = { x: 200, y: 350 }; // Increase X to "bow" the curve more to the right
  const P2 = { x: 20, y: 650 };  // Y is 850 for an ~85vh height

  // Function to calculate a point on a Quadratic Bezier Curve at time 't' (0 to 1)
  const getBezierPoint = (t) => {
    const x = (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x;
    const y = (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y;
    return { x, y };
  };

  const navItems = [
    { icon: <HiHome />, label: 'Home', path: '/', t: 0.2 },
    { icon: <HiUser />, label: 'About', path: '/about', t: 0.45 },
    { icon: <HiCode />, label: 'Work', path: '/work', t: 0.7 },
    { icon: <HiMail />, label: 'Contact', path: '/contact', t: 0.95 },
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
      {/* 1. Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-8 left-8 z-[70] w-14 h-14 flex items-center justify-center bg-indigo-600 text-white rounded-full border-2 border-white shadow-2xl pointer-events-auto active:scale-95 transition-all"
      >
        {isOpen ? <HiX size={32} /> : <HiMenu size={32} />}
      </button>

      {/* 2. The Curved Rail (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y}, ${P2.x} ${P2.y}`}
          fill="none"
          stroke="#BAE6FD"
          strokeWidth="32"
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{
            strokeDasharray: 1200,
            strokeDashoffset: isOpen ? 0 : 1200,
          }}
        />
      </svg>

      {/* 3. Navigation Items */}
      {navItems.map((item, idx) => {
        const { x, y } = getBezierPoint(item.t);
        
        return (
          <div
            key={idx}
            className={`absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
            style={{
              left: isOpen ? `${x}px` : `${P0.x}px`,
              top: isOpen ? `${y}px` : `${P0.y}px`,
              opacity: isOpen ? 1 : 0,
              transitionDelay: isOpen ? `${idx * 80}ms` : '0ms',
            }}
          >
            <div className="group relative pointer-events-auto -translate-x-1/2 -translate-y-1/2">
              <button
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className="w-14 h-14 flex items-center justify-center bg-indigo-600 text-white rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform"
              >
                {item.icon}
              </button>
              
              <span className="absolute left-16 top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap border border-white/10 shadow-xl">
                {item.label}
              </span>
            </div>
          </div>
        );
      })}
     
      {/* sign up/sign in buttons */}
      <div className="absolute top-10 right-8 flex space-x-4 pointer-events-auto">
        {isEmail ? (
           <div className="relative">
      
      {/* Profile Circle */}
      <div
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-white font-bold cursor-pointer"
      >
        {firstLetter}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2">

          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            <FaUser />
            Profile
          </div>

          <div
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
          >
            <FaSignOutAlt />
            Logout
          </div>

        </div>
      )}
    </div>
        ) : (
         <div>
           <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 bg-slate-800 text-gray-200 font-bold rounded-full border border-slate-600 hover:bg-slate-700 transition-colors"
          >
            Sign In
          </button>
          <button
          onClick={() => navigate('/signup')}
          className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-full border border-indigo-600 hover:bg-indigo-700 transition-colors"
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