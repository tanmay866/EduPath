import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Menu, X, Info, Mail, HelpCircle, FileText, Briefcase, Target } from 'lucide-react';
import { FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmModal from '../Comman/ConfirmModal';
import EduPathLogo from '../EduPathLogo';

const ArcNavbar = () => {
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isEmail, setIsEmail] = useState(sessionStorage.getItem("email"));
  const [firstName, setFirstName] = useState(sessionStorage.getItem("firstName"));
  const [lastName, setLastName] = useState(sessionStorage.getItem("lastName"));
  const [profilePicture, setProfilePicture] = useState(sessionStorage.getItem("profilePicture"));

  const [open, setOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [buildDropdownOpen, setBuildDropdownOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : 'U';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'User';

  // Listen for storage changes to update profile picture
  useEffect(() => {
    const handleStorageChange = () => {
      setIsEmail(sessionStorage.getItem("email"));
      setFirstName(sessionStorage.getItem("firstName"));
      setLastName(sessionStorage.getItem("lastName"));
      setProfilePicture(sessionStorage.getItem("profilePicture"));
      setImageLoadError(false); // Reset error when storage updates
    };

    // Listen for custom event when sessionStorage is updated
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sessionStorageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionStorageUpdated', handleStorageChange);
    };
  }, []);


  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleLogout = () => {
    setShowLogoutModal(true);
  }

  const confirmLogout = () => {
    sessionStorage.clear();
    
    // Update state to reflect logged out status
    setIsEmail(null);
    setFirstName(null);
    setLastName(null);
    setProfilePicture(null);
    
    // Notify other components
    window.dispatchEvent(new Event('sessionStorageUpdated'));

    toast.success("Logged out successfully 👋");

    setShowLogoutModal(false);

    navigate("/");
  };

  const cancelLogout = () => {
  setShowLogoutModal(false);
};

  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'ASSESSMENT', path: '/assessment' },
  ];

  const buildSubmenu = [
    { label: 'Resume Builder',     path: '/resume-builder',        icon: FileText },
    { label: 'Portfolio Generator', path: '/portfolio-generator',  icon: Briefcase },
    { label: 'ATS Analyzer',       path: '/ats-analyzer',          icon: Target },
  ];

  const contactSubmenu = [
    { label: 'About Us',   path: '/about',   icon: Info },
    { label: 'Contact Us', path: '/contact', icon: Mail },
    { label: 'FAQs',       path: '/faq',     icon: HelpCircle },
  ];

  useEffect(() => {
    const handler = (e) => {
      const insideNav = navRef.current && navRef.current.contains(e.target);
      const insideMobileMenu = mobileMenuRef.current && mobileMenuRef.current.contains(e.target);
      if (!insideNav && !insideMobileMenu) {
        setOpen(false);
        setMobileMenuOpen(false);
        setContactDropdownOpen(false);
        setBuildDropdownOpen(false);
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
            <div className="shrink-0">
              <button
                onClick={() => navigate('/')}
                className="transition-opacity hover:opacity-80 active:opacity-60"
              >
                <EduPathLogo size={34} showText={true} fontSize={22} />
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

              {/* Build Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setBuildDropdownOpen(true)}
                onMouseLeave={() => setBuildDropdownOpen(false)}
              >
                <button
                  className="flex items-center gap-2 text-white hover:text-gray-300 font-medium text-sm tracking-wide transition-colors group"
                >
                  <span className="relative pb-1">
                    BUILD
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </span>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${buildDropdownOpen ? 'rotate-90' : ''}`} />
                </button>

                {buildDropdownOpen && (
                  <div className="absolute top-full left-0 pt-2 w-56">
                    <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-2xl py-2 border border-white/10 overflow-hidden">
                      {/* Menu Items */}
                      <div className="py-1">
                        {buildSubmenu.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              navigate(item.path);
                              setBuildDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/20 transition-colors"
                          >
                            <item.icon size={18} className="text-gray-400" />
                            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                            <ChevronRight size={16} className="text-gray-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
                    <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-2xl py-2 border border-white/10 overflow-hidden">
                      {/* Menu Items */}
                      <div className="py-1">
                        {contactSubmenu.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              navigate(item.path);
                              setContactDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/20 transition-colors"
                          >
                            <item.icon size={18} className="text-gray-400" />
                            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                            <ChevronRight size={16} className="text-gray-500" />
                          </button>
                        ))}
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
                    {profilePicture && !imageLoadError ? (
                      <img 
                        src={profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={() => setImageLoadError(true)}
                        onLoad={() => setImageLoadError(false)}
                      />
                    ) : (
                      firstLetter
                    )}
                  </div>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute right-0 mt-2 w-72 backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-2xl py-2 border border-white/10 overflow-hidden animate-slideDown">
                      {/* Profile Header */}
                      <div className="px-4 py-3 bg-slate-800/50 flex gap-3 items-center border-b border-white/10">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                          {profilePicture && !imageLoadError ? (
                            <img 
                              src={profilePicture} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                              onError={() => setImageLoadError(true)}
                              onLoad={() => setImageLoadError(false)}
                            />
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
                      <div className="border-t border-white/10 my-1"></div>

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
                    className="px-8 py-3 backdrop-blur-lg bg-linear-to-r from-white/10 to-white/5 text-white font-semibold rounded-full hover:from-white/20 hover:to-white/15 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-white/20 border border-white/20 hover:border-white/40 hover:scale-105 hover:-translate-y-0.5"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-8 py-3 backdrop-blur-lg bg-linear-to-r from-white/20 to-white/10 text-white font-semibold rounded-full hover:from-white/30 hover:to-white/20 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-white/30 border border-white/30 hover:border-white/50 hover:scale-105 hover:-translate-y-0.5"
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
      </nav>

      {/* Mobile Menu — outside nav pill so it doesn't get clipped */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40 backdrop-blur-xl bg-slate-900/80 rounded-2xl shadow-2xl border border-white/10">
          <div className="px-6 py-5 space-y-2">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-white hover:bg-white/10 px-4 py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}

              {/* Build Dropdown in Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setBuildDropdownOpen(!buildDropdownOpen)}
                  className="w-full flex items-center justify-between text-white hover:bg-white/10 px-4 py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  <span>BUILD</span>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${buildDropdownOpen ? 'rotate-90' : ''}`} />
                </button>
                {buildDropdownOpen && (
                  <div className="pl-4 space-y-1 bg-white/5 rounded-xl p-2 border border-white/10">
                    {buildSubmenu.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                          setBuildDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-lg text-sm transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Dropdown in Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setContactDropdownOpen(!contactDropdownOpen)}
                  className="w-full flex items-center justify-between text-white hover:bg-white/10 px-4 py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  <span>CONTACT</span>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${contactDropdownOpen ? 'rotate-90' : ''}`} />
                </button>
                {contactDropdownOpen && (
                  <div className="pl-4 space-y-1 bg-white/5 rounded-xl p-2 border border-white/10">
                    {contactSubmenu.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                          setContactDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-lg text-sm transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {isEmail ? (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <FaUser className="text-gray-400" />
                    <span className="text-sm font-medium">My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <FaCog className="text-gray-400" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <FaSignOutAlt />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => {
                      navigate('/signin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-8 py-3 backdrop-blur-lg bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-8 py-3 backdrop-blur-lg bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30 hover:border-white/50"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

          <ConfirmModal
            isOpen={showLogoutModal}
            message="Are you sure you want to logout?"
            onConfirm={confirmLogout}
            onCancel={cancelLogout}
          />
    </>
  );
};

export default ArcNavbar;