import User from '../models/userModel.js';
import cloudinary from '../config/cloudinaryConfig.js';

const normalizeExperienceLevel = (value) => {
  if (!value) {
    return '';
  }

  const normalized = String(value).trim().toLowerCase();
  const validLevels = ['beginner', 'intermediate', 'advanced'];

  return validLevels.includes(normalized) ? normalized : '';
};

const toDisplayExperienceLevel = (value) => {
  const normalized = normalizeExperienceLevel(value);
  if (!normalized) {
    return '';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const normalizeCurrentSkills = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item) {
        return '';
      }

      if (typeof item === 'string') {
        return item.trim();
      }

      if (typeof item === 'object' && item.skill) {
        return String(item.skill).trim();
      }

      return String(item).trim();
    })
    .filter(Boolean);
};

const syncRoadmapProfileState = (user, updates) => {
  if (updates.target_role !== undefined) {
    user.target_role = updates.target_role;
    user.profile = user.profile || {};
    user.profile.targetRole = updates.target_role;
  }

  if (updates.experience_level !== undefined) {
    user.experience_level = normalizeExperienceLevel(updates.experience_level);
    user.profile = user.profile || {};
    user.profile.occupation = user.profile.occupation || {};
    user.profile.occupation.experienceLevel = toDisplayExperienceLevel(
      updates.experience_level
    );
  }

  if (updates.current_skills !== undefined) {
    user.current_skills = updates.current_skills;
    user.profile = user.profile || {};
    user.profile.currentSkills = normalizeCurrentSkills(updates.current_skills);
  }

  if (updates.hours_per_week !== undefined) {
    user.hours_per_week = Number(updates.hours_per_week) || 0;
    user.profile = user.profile || {};
    user.profile.availableLearningTime = Number(updates.hours_per_week) || 0;
  }

  if (updates.learning_style !== undefined) {
    user.learning_style = updates.learning_style;
  }

  const hasRoadmapFields = Boolean(
    user.target_role && user.experience_level && user.hours_per_week
  );

  if (hasRoadmapFields) {
    user.profile_complete = true;
  }
};

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
        target_role: user.target_role || '',
        experience_level: user.experience_level || '',
        hours_per_week: user.hours_per_week || 0,
        learning_style: user.learning_style || '',
        current_skills: user.current_skills || [],
        profile_complete: Boolean(user.profile_complete),
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

    const hasRoadmapFields = Boolean(
      user.target_role && user.experience_level && user.hours_per_week
    );
    if (hasRoadmapFields) {
      user.profile_complete = true;
    }

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
        target_role: updatedUser.target_role || '',
        experience_level: updatedUser.experience_level || '',
        hours_per_week: updatedUser.hours_per_week || 0,
        learning_style: updatedUser.learning_style || '',
        current_skills: updatedUser.current_skills || [],
        profile_complete: Boolean(updatedUser.profile_complete),
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

// @desc    Update basic profile details
// @route   PUT /api/profile/basic
// @access  Private
export const updateBasic = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update skill profile details
// @route   PUT /api/profile/skills
// @access  Private
export const updateSkills = async (req, res) => {
  try {
    const { target_role, experience_level, current_skills } = req.body;

    // Check if profile is now complete
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    syncRoadmapProfileState(user, { target_role, experience_level, current_skills });

    const updated = await user.save();

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update learning availability
// @route   PUT /api/profile/availability
// @access  Private
export const updateAvailability = async (req, res) => {
  try {
    const { hours_per_week, learning_style } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    syncRoadmapProfileState(user, { hours_per_week, learning_style });

    const updated = await user.save();

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
