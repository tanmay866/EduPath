import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Menu, X, Info, Mail } from 'lucide-react';
import { FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const ArcNavbar = () => {
  const navRef = useRef(null);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEmail = sessionStorage.getItem("email");
  const firstName = sessionStorage.getItem("firstName");
  const lastName = sessionStorage.getItem("lastName");
  const profilePicture = sessionStorage.getItem("profilePicture");

  const [open, setOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);

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
    { label: 'HOME', path: '/' },
    { label: 'ASSESSMENT', path: '/assessment' },
  ];

  const contactSubmenu = [
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
        setMobileMenuOpen(false);
        setContactDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <nav ref={navRef} className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 backdrop-blur-lg bg-white/5 rounded-full shadow-xl border border-white/10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold transition-colors"
              >
                <span className="text-white hover:text-gray-300">Edu</span>
                <span className="text-cyan-400 hover:text-cyan-300">Path</span>
              </button>
            </div>

            {/* Center Navigation Menu - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2 text-white hover:text-gray-300 font-medium text-sm tracking-wide transition-colors group"
                >
                  <span className="relative pb-1">
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </span>
                  <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
              
              {/* Contact Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setContactDropdownOpen(true)}
                onMouseLeave={() => setContactDropdownOpen(false)}
              >
                <button
                  className="flex items-center gap-2 text-white hover:text-gray-300 font-medium text-sm tracking-wide transition-colors group"
                >
                  <span className="relative pb-1">
                    CONTACT
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </span>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${contactDropdownOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {contactDropdownOpen && (
                  <div className="absolute top-full left-0 pt-2 w-56">
                    <div className="backdrop-blur-xl bg-slate-900/95 rounded-xl shadow-2xl py-2 border border-white/30 overflow-hidden">
                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/about');
                            setContactDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/20 transition-colors"
                        >
                          <Info size={18} className="text-gray-400" />
                          <span className="flex-1 text-left text-sm font-medium">About Us</span>
                          <ChevronRight size={16} className="text-gray-500" />
                        </button>

                        <button
                          onClick={() => {
                            navigate('/contact');
                            setContactDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/20 transition-colors"
                        >
                          <Mail size={18} className="text-gray-400" />
                          <span className="flex-1 text-left text-sm font-medium">Contact Us</span>
                          <ChevronRight size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {isEmail ? (
                <div className="relative">
                  {/* Profile Circle */}
                  <div
                    onClick={() => setOpen(!open)}
                    className="w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-lg bg-white/20 text-white font-bold cursor-pointer overflow-hidden hover:bg-white/30 transition-colors border border-white/30"
                  >
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      firstLetter
                    )}
                  </div>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute right-0 mt-2 w-72 backdrop-blur-xl bg-slate-900/95 rounded-xl shadow-2xl py-2 border border-white/30 overflow-hidden animate-slideDown">
                      {/* Profile Header */}
                      <div className="px-4 py-3 bg-slate-800/80 flex gap-3 items-center border-b border-white/20">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                          {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            firstLetter
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-white truncate">{fullName}</h4>
                          <p className="text-xs text-gray-400 truncate">{isEmail}</p>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/20 transition-colors"
                        >
                          <FaUser className="text-gray-400" />
                          <span className="flex-1 text-left text-sm font-medium">My Profile</span>
                          <ChevronRight size={16} className="text-gray-500" />
                        </button>

                        <button
                          onClick={() => {
                            navigate('/settings');
                            setOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/20 transition-colors"
                        >
                          <FaCog className="text-gray-400" />
                          <span className="flex-1 text-left text-sm font-medium">Settings</span>
                          <ChevronRight size={16} className="text-gray-500" />
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/20 my-1"></div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <FaSignOutAlt />
                        <span className="text-sm font-medium">Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signin')}
                    className="px-8 py-3 backdrop-blur-lg bg-gradient-to-r from-white/10 to-white/5 text-white font-semibold rounded-full hover:from-white/20 hover:to-white/15 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-white/20 border border-white/20 hover:border-white/40 hover:scale-105 hover:-translate-y-0.5"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-8 py-3 backdrop-blur-lg bg-gradient-to-r from-white/20 to-white/10 text-white font-semibold rounded-full hover:from-white/30 hover:to-white/20 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-white/30 border border-white/30 hover:border-white/50 hover:scale-105 hover:-translate-y-0.5"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden backdrop-blur-xl bg-slate-900/95 rounded-3xl mt-4 mx-4 shadow-2xl border border-white/30">
            <div className="px-6 py-4 space-y-3">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium text-sm transition-colors"
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
              
              {/* Contact Dropdown in Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setContactDropdownOpen(!contactDropdownOpen)}
                  className="w-full flex items-center justify-between text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium text-sm transition-colors"
                >
                  <span>CONTACT</span>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${contactDropdownOpen ? 'rotate-90' : ''}`} />
                </button>
                {contactDropdownOpen && (
                  <div className="pl-4 space-y-1 backdrop-blur-xl bg-slate-800/90 rounded-lg p-2 border border-white/30">
                    {contactSubmenu.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                          setContactDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-white hover:bg-white/20 rounded-lg text-sm transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {isEmail ? (
                <div className="pt-3 border-t border-white/20 space-y-3">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg"
                  >
                    <FaUser className="text-gray-400" />
                    <span className="text-sm font-medium">My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg"
                  >
                    <FaCog className="text-gray-400" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-lg"
                  >
                    <FaSignOutAlt />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-white/20 space-y-3">
                  <button
                    onClick={() => {
                      navigate('/signin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-8 py-3 backdrop-blur-lg bg-gradient-to-r from-white/10 to-white/5 text-white font-semibold rounded-full hover:from-white/20 hover:to-white/15 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-white/20 border border-white/20 hover:border-white/40 hover:scale-[1.02]"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-8 py-3 backdrop-blur-lg bg-gradient-to-r from-white/20 to-white/10 text-white font-semibold rounded-full hover:from-white/30 hover:to-white/20 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-white/30 border border-white/30 hover:border-white/50 hover:scale-[1.02]"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default ArcNavbar;