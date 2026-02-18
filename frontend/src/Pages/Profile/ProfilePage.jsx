import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings as SettingsIcon, Save, ArrowLeft, ChevronDown, X, ZoomIn, ZoomOut } from 'lucide-react';
import { getProfile, updateProfile } from '../Services/profileService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    const email = sessionStorage.getItem('email');
    if (!email) {
      navigate('/signin');
      return;
    }

    // Load data from sessionStorage
    loadProfileData();
  }, [navigate]);

  const loadProfileData = () => {
    const firstName = sessionStorage.getItem('firstName') || '';
    const lastName = sessionStorage.getItem('lastName') || '';
    const email = sessionStorage.getItem('email') || '';
    const phone = sessionStorage.getItem('phone') || '';
    const skills = sessionStorage.getItem('skills') || '';
    const role = sessionStorage.getItem('role') || 'student';
    const profilePicture = sessionStorage.getItem('profilePicture') || '';

    setProfileData({ firstName, lastName, email, phone, skills, role, profilePicture });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSaveEditedImage = () => {
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
    
    setProfileData(prev => ({
      ...prev,
      profilePicture: croppedImage
    }));
    
    setShowImageEditor(false);
    setTempImage(null);
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
        role: profileData.role,
        profilePicture: profileData.profilePicture
      });

      if (response.success) {
        setMessage('Profile updated successfully!');
        sessionStorage.setItem('firstName', profileData.firstName);
        sessionStorage.setItem('lastName', profileData.lastName);
        sessionStorage.setItem('phone', profileData.phone);
        sessionStorage.setItem('skills', profileData.skills);
        sessionStorage.setItem('role', profileData.role);
        sessionStorage.setItem('profilePicture', profileData.profilePicture);

        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim() || 'Your Name';
  const initials = `${profileData.firstName?.charAt(0) || ''}${profileData.lastName?.charAt(0) || ''}`.toUpperCase() || 'YN';

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-6 bg-green-500 border border-green-600 text-white px-6 py-4 rounded-xl font-medium">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-500 border border-red-600 text-white px-6 py-4 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <input
                    type="file"
                    id="profile-picture-input"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {profileData.profilePicture ? (
                    <img
                      src={profileData.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-700"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors border-2 border-slate-800"
                  >
                    ✏️
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">{fullName}</h2>
                <p className="text-gray-400 text-sm mb-4">{profileData.email}</p>
                
                <div className="border-t border-slate-700 pt-4 mt-4">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-400 text-sm">Role</span>
                    <span className="text-white font-medium capitalize">{profileData.role || 'Student'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-400 text-sm">Login ID</span>
                    <span className="text-white font-medium">{sessionStorage.getItem('loginId') || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className="px-3 py-1 bg-green-700 bg-opacity-20 text-white-500 rounded-full text-xs font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Card - Navigate to Settings Page */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-indigo-600 transition-all cursor-pointer group" onClick={() => navigate('/settings')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <SettingsIcon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Settings</h3>
                    <p className="text-gray-400 text-sm">Manage your preferences</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-white transition-colors">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2">
            {/* Profile Information Card */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                  <p className="text-gray-400 text-sm">Update your personal details</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Add phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={profileData.role}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                      <option value="teacher">Teacher</option>
                      <option value="manager">Manager</option>
                      <option value="entrepreneur">Entrepreneur</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={profileData.skills}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Adjust Profile Picture</h3>
              <button
                onClick={handleCancelImageEdit}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
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
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
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
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => setImageScale(prev => Math.min(5, prev + 0.1))}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <ZoomIn size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelImageEdit}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedImage}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
