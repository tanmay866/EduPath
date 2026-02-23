import User from '../models/userModel.js';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        skills: user.profile?.skills || '',
        role: user.role || 'student',
        profilePicture: user.profile?.avatar || '',
        loginId: user.loginId || ''
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, skills, role, profilePicture } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate phone number if provided
    if (phone && phone.length > 0 && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Validate role if provided
    const validRoles = ['student', 'developer', 'other', 'admin', 'teacher', 'manager', 'entrepreneur', 'instructor'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected'
      });
    }

    // Update root level fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (role !== undefined) user.role = role;
    
    // Update profile nested fields
    if (!user.profile) {
      user.profile = {};
    }
    
    if (phone !== undefined) user.profile.phone = phone;
    if (skills !== undefined) user.profile.skills = skills;
    if (profilePicture !== undefined) user.profile.avatar = profilePicture;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.profile?.phone || '',
        skills: updatedUser.profile?.skills || '',
        role: updatedUser.role,
        profilePicture: updatedUser.profile?.avatar || '',
        loginId: updatedUser.loginId
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/profile/settings
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    const { theme, language, notificationEnabled } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update settings
    if (theme !== undefined) user.theme = theme;
    if (language !== undefined) user.language = language;
    if (notificationEnabled !== undefined) user.notificationEnabled = notificationEnabled;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        theme: user.theme,
        language: user.language,
        notificationEnabled: user.notificationEnabled
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};
