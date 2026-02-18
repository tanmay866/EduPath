import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getProfile, updateProfile } from '../../Pages/Services/profileService';

const Profile = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load profile data when modal opens
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = () => {
    const firstName = sessionStorage.getItem('firstName') || '';
    const lastName = sessionStorage.getItem('lastName') || '';
    const email = sessionStorage.getItem('email') || '';
    const phone = sessionStorage.getItem('phone') || '';

    setFormData({
      firstName,
      lastName,
      email,
      phone
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });

      if (response.success) {
        setMessage('Profile updated successfully!');
        // Update sessionStorage
        sessionStorage.setItem('firstName', formData.firstName);
        sessionStorage.setItem('lastName', formData.lastName);
        sessionStorage.setItem('phone', formData.phone);
        
        setTimeout(() => {
          setMessage('');
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Your name';
  const initials = `${formData.firstName?.charAt(0) || ''}${formData.lastName?.charAt(0) || ''}`.toUpperCase() || 'YN';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-11/12 max-w-md max-h-[90vh] overflow-y-auto relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Profile Header */}
        <div className="px-8 pt-8 pb-6 text-center bg-gray-50 border-b border-gray-200">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
              {initials}
            </div>
            <button
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Change profile picture"
            >
              ✏️
            </button>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">{fullName}</h2>
          <p className="text-gray-600 text-sm mt-1">{formData.email}</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Name */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Name
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Email account
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
            />
          </div>

          {/* Mobile Number */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Mobile number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Add number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Saving...' : 'Save Change'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
