import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Menu, X } from 'lucide-react';
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
      <nav ref={navRef} className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 bg-gradient-to-r from-blue-100 via-purple-100 to-orange-100 rounded-full shadow-xl">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                EduPath
              </button>
            </div>

            {/* Center Navigation Menu - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2 text-gray-900 hover:text-gray-700 font-medium text-sm tracking-wide transition-colors group"
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} className="text-gray-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
              
              {/* Contact Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setContactDropdownOpen(true)}
                onMouseLeave={() => setContactDropdownOpen(false)}
              >
                <button
                  className="flex items-center gap-2 text-gray-900 hover:text-gray-700 font-medium text-sm tracking-wide transition-colors group"
                >
                  <span>CONTACT</span>
                  <ChevronRight size={16} className={`text-gray-600 transition-transform ${contactDropdownOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {contactDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                    {contactSubmenu.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setContactDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-gray-900 hover:bg-gray-100 text-sm font-medium transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
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
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-white font-bold cursor-pointer overflow-hidden hover:bg-gray-800 transition-colors"
                  >
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      firstLetter
                    )}
                  </div>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl py-2 border border-gray-200 overflow-hidden animate-slideDown">
                      {/* Profile Header */}
                      <div className="px-4 py-3 bg-gray-50 flex gap-3 items-center border-b border-gray-200">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                          {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            firstLetter
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 truncate">{fullName}</h4>
                          <p className="text-xs text-gray-600 truncate">{isEmail}</p>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <FaUser className="text-gray-600" />
                          <span className="flex-1 text-left text-sm font-medium">My Profile</span>
                          <ChevronRight size={16} className="text-gray-400" />
                        </button>

                        <button
                          onClick={() => {
                            navigate('/settings');
                            setOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <FaCog className="text-gray-600" />
                          <span className="flex-1 text-left text-sm font-medium">Settings</span>
                          <ChevronRight size={16} className="text-gray-400" />
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
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
                    className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white rounded-3xl mt-4 mx-4 shadow-lg">
            <div className="px-6 py-4 space-y-3">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium text-sm transition-colors"
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              ))}
              
              {/* Contact Dropdown in Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setContactDropdownOpen(!contactDropdownOpen)}
                  className="w-full flex items-center justify-between text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium text-sm transition-colors"
                >
                  <span>CONTACT</span>
                  <ChevronRight size={16} className={`text-gray-600 transition-transform ${contactDropdownOpen ? 'rotate-90' : ''}`} />
                </button>
                {contactDropdownOpen && (
                  <div className="pl-4 space-y-1">
                    {contactSubmenu.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                          setContactDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {isEmail ? (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <FaUser className="text-gray-600" />
                    <span className="text-sm font-medium">My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <FaCog className="text-gray-600" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FaSignOutAlt />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <button
                    onClick={() => {
                      navigate('/signin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-50 transition-all shadow-md"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-md"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-28"></div>
    </>
  );
};

export default ArcNavbar;