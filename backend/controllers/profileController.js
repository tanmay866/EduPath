import User from '../models/userModel.js';
import cloudinary from '../config/cloudinaryConfig.js';

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
    const { firstName, lastName, phone, skills, role } = req.body;

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
        profilePicture: '', // Not stored in MongoDB, only in Cloudinary
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

// @desc    Upload profile picture to Cloudinary (NOT stored in MongoDB)
// @route   POST /api/profile/upload-picture
// @access  Private
export const uploadProfilePicture = async (req, res) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile picture from Cloudinary using consistent naming
    const publicId = `edupath/profile-pictures/${user._id}`;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      // Ignore error if file doesn't exist
      console.log('No previous avatar to delete or deletion failed');
    }

    // Upload new picture to Cloudinary with consistent public_id (overwrites if exists)
    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder: 'edupath/profile-pictures',
      public_id: user._id.toString(), // Use userId as filename for consistency
      overwrite: true, // Overwrite existing file
      resource_type: 'image',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    // Return Cloudinary URL (NOT saved to MongoDB)
    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully to Cloudinary',
      data: {
        profilePicture: uploadResult.secure_url
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};

// @desc    Delete profile picture from Cloudinary (NOT from MongoDB)
// @route   DELETE /api/profile/delete-picture
// @access  Private
export const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete from Cloudinary using consistent naming
    const publicId = `edupath/profile-pictures/${user._id}`;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting avatar from Cloudinary:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting profile picture from Cloudinary'
      });
    }

    // No database update needed - picture only exists in Cloudinary
    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully from Cloudinary'
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile picture',
      error: error.message
    });
  }
};
