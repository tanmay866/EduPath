import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings as SettingsIcon, Save, ArrowLeft, ChevronDown, X, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { getProfile, updateProfile, uploadProfilePicture } from '../Services/profileService';
import { getProfilePictureUrl } from '../../utils/cloudinaryHelper';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  // Image Editor Modal State
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Profile Data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skills: '',
    role: 'student',
    profilePicture: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Load data from backend
    loadProfileDataFromBackend();
  }, [navigate]);

  // Scroll-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const loadProfileDataFromBackend = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      
      if (response.success) {
        const profile = response.data;
        
        // Get userId from sessionStorage to construct Cloudinary URL
        const userId = sessionStorage.getItem('userId');
        const profilePictureUrl = sessionStorage.getItem('profilePicture') || 
                                  (userId ? getProfilePictureUrl(userId) : '');
        
        // Update state
        setProfileData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          skills: profile.skills || '',
          role: profile.role || 'student',
          profilePicture: profilePictureUrl
        });

        // Also update sessionStorage for quick access
        sessionStorage.setItem('firstName', profile.firstName || '');
        sessionStorage.setItem('lastName', profile.lastName || '');
        sessionStorage.setItem('email', profile.email || '');
        sessionStorage.setItem('phone', profile.phone || '');
        sessionStorage.setItem('skills', profile.skills || '');
        sessionStorage.setItem('role', profile.role || 'student');
        sessionStorage.setItem('profilePicture', profilePictureUrl);
        sessionStorage.setItem('loginId', profile.loginId || '');
        
        // Notify other components that sessionStorage has been updated
        window.dispatchEvent(new Event('sessionStorageUpdated'));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Fallback to sessionStorage if API fails
      const firstName = sessionStorage.getItem('firstName') || '';
      const lastName = sessionStorage.getItem('lastName') || '';
      const email = sessionStorage.getItem('email') || '';
      const phone = sessionStorage.getItem('phone') || '';
      const skills = sessionStorage.getItem('skills') || '';
      const role = sessionStorage.getItem('role') || 'student';
      const userId = sessionStorage.getItem('userId');
      const profilePicture = sessionStorage.getItem('profilePicture') || 
                            (userId ? getProfilePictureUrl(userId) : '');

      setProfileData({ firstName, lastName, email, phone, skills, role, profilePicture });
      
      setError('Could not load profile from server');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // For phone field, only allow numbers
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setProfileData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setShowImageEditor(true);
        setImageScale(1);
        setImagePosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEditedImage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;

    if (!image) return;

    // Set canvas size for circular crop
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate image dimensions and position
    const scaledWidth = image.width * imageScale;
    const scaledHeight = image.height * imageScale;
    const x = (size - scaledWidth) / 2 + imagePosition.x;
    const y = (size - scaledHeight) / 2 + imagePosition.y;

    // Draw image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    ctx.restore();

    // Get the cropped image as data URL
    const croppedImage = canvas.toDataURL('image/png');
    
    // Upload to Cloudinary
    setUploadingPicture(true);
    setError('');
    
    try {
      const response = await uploadProfilePicture(croppedImage);
      
      if (response.success) {
        // Update profile data with Cloudinary URL
        setProfileData(prev => ({
          ...prev,
          profilePicture: response.data.profilePicture
        }));
        
        // Reset image load error since we have a new valid image
        setImageLoadError(false);
        
        // Update sessionStorage
        sessionStorage.setItem('profilePicture', response.data.profilePicture);
        
        // Notify other components that sessionStorage has been updated
        window.dispatchEvent(new Event('sessionStorageUpdated'));
        
        setMessage('Profile picture updated successfully!');
        setTimeout(() => setMessage(''), 3000);
        
        // Close editor
        setShowImageEditor(false);
        setTempImage(null);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload profile picture');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleCancelImageEdit = () => {
    setShowImageEditor(false);
    setTempImage(null);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
    // Reset file input
    document.getElementById('profile-picture-input').value = '';
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setImagePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (tempImage && showImageEditor) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawPreview();
      };
      img.src = tempImage;
    }
  }, [tempImage, showImageEditor, imageScale, imagePosition]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;
    if (!image) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, size, size);

    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate image dimensions and position
    const scaledWidth = image.width * imageScale;
    const scaledHeight = image.height * imageScale;
    const x = (size - scaledWidth) / 2 + imagePosition.x;
    const y = (size - scaledHeight) / 2 + imagePosition.y;

    // Draw image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    ctx.restore();

    // Draw circle border
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const handleImageClick = () => {
    document.getElementById('profile-picture-input').click();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        skills: profileData.skills,
        role: profileData.role
      });

      if (response.success) {
        setMessage('Profile updated successfully!');
        
        // Update sessionStorage with the returned data
        const updatedProfile = response.data;
        sessionStorage.setItem('firstName', updatedProfile.firstName || profileData.firstName);
        sessionStorage.setItem('lastName', updatedProfile.lastName || profileData.lastName);
        sessionStorage.setItem('phone', updatedProfile.phone || profileData.phone);
        sessionStorage.setItem('skills', updatedProfile.skills || profileData.skills);
        sessionStorage.setItem('role', updatedProfile.role || profileData.role);

        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Save profile error:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim() || 'Your Name';
  const firstLetter = profileData.firstName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-8 relative overflow-hidden flex flex-col justify-center">
      {/* Profile page background — subtle grid + slow drifting orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div style={{
          position: 'absolute', top: '8%', left: '10%',
          width: 420, height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)',
          animation: 'profileOrb1 18s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%',
          width: 360, height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)',
          animation: 'profileOrb2 22s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', top: '45%', right: '20%',
          width: 260, height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.03), transparent 70%)',
          animation: 'profileOrb1 26s ease-in-out infinite alternate-reverse',
        }} />
      </div>
      <style>{`
        @keyframes profileOrb1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes profileOrb2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-35px, -25px) scale(1.06); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 relative z-10 items-start">
        {/* Left Column (Spans 4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div data-animate className="mb-6 flex items-center gap-4" style={{transitionDelay: '0s'}}>
            <button
              onClick={() => navigate('/')}
              className="p-2.5 backdrop-blur-lg bg-white/[0.03] hover:bg-white/[0.1] rounded-xl transition-all border border-white/5"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white leading-none tracking-tight">Profile</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your account settings</p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className="mb-4 backdrop-blur-lg bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl font-medium shadow-xl text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 backdrop-blur-lg bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl font-medium shadow-xl text-sm">
              {error}
            </div>
          )}

          {/* Profile Card */}
          <div data-animate className="backdrop-blur-xl bg-[#0a0a0a]/80 rounded-[2rem] p-8 border border-white/5 transition-all shadow-xl flex flex-col items-center" style={{transitionDelay: '0.1s'}}>
            <div className="relative inline-block mb-5 group">
              <input
                type="file"
                id="profile-picture-input"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {profileData.profilePicture && !imageLoadError ? (
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-indigo-500/40 to-violet-500/40 backdrop-blur-sm">
                  <img
                    src={profileData.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border border-white/10"
                    onError={() => setImageLoadError(true)}
                    onLoad={() => setImageLoadError(false)}
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-4xl shadow-inner border border-white/10">
                  {firstLetter}
                </div>
              )}
              <button
                type="button"
                onClick={handleImageClick}
                className="absolute bottom-0 right-0 w-9 h-9 backdrop-blur-lg bg-indigo-500 border-2 border-[#0a0a0a] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-indigo-500/40 group-hover:bg-indigo-400"
              >
                <div className="w-4 h-4 bg-white/20 rounded-sm opacity-80" />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-white tracking-tight">{fullName}</h2>
            <p className="text-slate-400 text-sm mb-6 bg-white/[0.03] px-3 py-1 rounded-full mt-2 font-medium">{profileData.email}</p>
            
            <div className="w-full border-t border-white/5 pt-5 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Role</span>
                <span className="text-slate-300 font-medium capitalize text-sm">{profileData.role || 'Student'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Login ID</span>
                <span className="text-slate-300 font-medium text-sm">{sessionStorage.getItem('loginId') || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Status</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] uppercase tracking-widest font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div data-animate className="backdrop-blur-xl bg-[#0a0a0a]/50 rounded-[1.5rem] p-5 border border-white/5 hover:bg-[#0a0a0a]/80 transition-all cursor-pointer group shadow-lg flex items-center justify-between" onClick={() => navigate('/resume')} style={{transitionDelay: '0.2s'}}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all">
                <FileText size={20} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Resume</h3>
                <p className="text-slate-500 text-xs mt-0.5">Manage your documents</p>
              </div>
            </div>
            <ArrowLeft className="text-slate-600 group-hover:text-white transition-colors rotate-180" size={18} />
          </div>

          <div data-animate className="backdrop-blur-xl bg-[#0a0a0a]/50 rounded-[1.5rem] p-5 border border-white/5 hover:bg-[#0a0a0a]/80 transition-all cursor-pointer group shadow-lg flex items-center justify-between" onClick={() => navigate('/settings')} style={{transitionDelay: '0.3s'}}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800/50 border border-white/10 rounded-xl flex items-center justify-center group-hover:scale-105 group-hover:bg-white/5 transition-all">
                <SettingsIcon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Settings</h3>
                <p className="text-slate-500 text-xs mt-0.5">App preferences</p>
              </div>
            </div>
            <ArrowLeft className="text-slate-600 group-hover:text-white transition-colors rotate-180" size={18} />
          </div>
        </div>

        {/* Right Column (Spans 8 Columns) */}
        <div className="lg:col-span-8 backdrop-blur-3xl bg-[#090b14]/70 rounded-[2rem] border border-white/5 shadow-2xl p-6 lg:p-10 relative flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8 shrink-0">
            <div className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center">
              <User size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Profile Information</h2>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] uppercase tracking-wider font-bold text-indigo-400 mt-2 inline-block">
                Editable Details
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 flex-1 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-1 rounded-2xl">
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider uppercase ml-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors"
                  placeholder="Enter first name"
                />
              </div>
              <div className="p-1 rounded-2xl">
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider uppercase ml-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-1 rounded-2xl opacity-80">
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider uppercase ml-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-5 py-4 bg-[#050505] border border-white/5 rounded-xl text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-2 ml-2 italic">Cannot be changed</p>
              </div>
              <div className="p-1 rounded-2xl">
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider uppercase ml-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength="10"
                  className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors"
                  placeholder="Add phone number"
                />
              </div>
            </div>

            <div className="p-1 rounded-2xl">
              <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider uppercase ml-2">
                Primary Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={profileData.role}
                  onChange={handleProfileChange}
                  className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors appearance-none cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="student" className="bg-[#0a0a0a] text-white">Student</option>
                  <option value="developer" className="bg-[#0a0a0a] text-white">Developer</option>
                  <option value="other" className="bg-[#0a0a0a] text-white">Other</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="p-1 rounded-2xl">
              <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider uppercase ml-2">
                Skills
              </label>
              <input
                type="text"
                name="skills"
                value={profileData.skills}
                onChange={handleProfileChange}
                className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors"
                placeholder="e.g., JavaScript, React, Node.js"
              />
            </div>

            <div className="pt-8 mt-auto border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-xl font-bold text-sm transition-all duration-500 group bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <span className="tracking-wide">{loading ? 'Saving Changes...' : 'Save Profile Details'}</span>
                {!loading && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Save size={12} className="text-white" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Adjust Profile Picture</h3>
              <button
                onClick={handleCancelImageEdit}
                className="p-2 backdrop-blur-lg bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Canvas Preview */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="rounded-full border-4 border-indigo-600 cursor-move"
                  style={{ width: '300px', height: '300px' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                <p className="text-center text-gray-400 text-sm mt-3">
                  Drag to reposition
                </p>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <ZoomIn size={16} className="inline mr-2" />
                Zoom
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setImageScale(prev => Math.max(0.2, prev - 0.1))}
                  className="p-2 backdrop-blur-lg bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                >
                  <ZoomOut size={18} className="text-white" />
                </button>
                <input
                  type="range"
                  min="0.2"
                  max="5"
                  step="0.1"
                  value={imageScale}
                  onChange={(e) => setImageScale(parseFloat(e.target.value))}
                  className="flex-1 h-2 backdrop-blur-lg bg-white/10 rounded-lg appearance-none cursor-pointer border border-white/20"
                />
                <button
                  onClick={() => setImageScale(prev => Math.min(5, prev + 0.1))}
                  className="p-2 backdrop-blur-lg bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                >
                  <ZoomIn size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelImageEdit}
                disabled={uploadingPicture}
                className="flex-1 px-4 py-3 backdrop-blur-lg bg-slate-600/30 hover:bg-slate-600/40 text-white font-semibold rounded-xl transition-all border border-slate-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedImage}
                disabled={uploadingPicture}
                className="flex-1 px-4 py-3 backdrop-blur-lg bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold rounded-xl transition-all border border-indigo-400/50 hover:border-indigo-400/70 hover:shadow-xl hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingPicture ? 'Uploading...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
