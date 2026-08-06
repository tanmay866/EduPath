import User from '../models/userModel.js';
import cloudinary from '../config/cloudinaryConfig.js';
import { CAREER_ROLES, isCareerRole } from '../utils/careerRoles.js';
import { LEARNING_STYLES, isLearningStyle } from '../utils/learningStyles.js';

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
        tour_seen: Boolean(user.tour_seen_at),
        profilePicture: user.profile?.avatar || '',
        loginId: user.loginId || '',
        weekly_email: Boolean(user.weeklyEmail?.enabled)
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
    const {
      firstName,
      lastName,
      phone,
      skills,
      role,
      target_role,
      experience_level,
      hours_per_week,
      learning_style,
      current_skills,
    } = req.body;

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

    // The account role is what isAdmin checks, and this endpoint is reachable
    // by any signed-in user — so accepting `role` here let anyone hand
    // themselves the admin dashboard by posting {"role":"admin"}. It is now
    // read-only from the profile; changing it is an admin/seed operation.
    //
    // Echoing the current value back is still allowed, so older clients that
    // send the whole profile object keep working.
    if (role !== undefined && role !== user.role) {
      return res.status(403).json({
        success: false,
        message: 'Account role cannot be changed from the profile.'
      });
    }

    // target_role is the career track the roadmap is built from. Only the
    // roles the AI service has a curriculum for are accepted; '' means the
    // user has not chosen yet.
    if (target_role !== undefined && target_role !== '' && !isCareerRole(target_role)) {
      return res.status(400).json({
        success: false,
        message: `Target role must be one of: ${CAREER_ROLES.join(', ')}`
      });
    }

    // These are reported in the response below, so accept them here too. They
    // used to be dropped silently while the endpoint still answered 200, which
    // made a failed update indistinguishable from a successful one.
    // The AI service falls back to "mixed" for a style it does not recognise,
    // so an unchecked value would look like the setting simply did nothing.
    if (learning_style !== undefined && learning_style !== '' && !isLearningStyle(learning_style)) {
      return res.status(400).json({
        success: false,
        message: `Learning style must be one of: ${LEARNING_STYLES.join(', ')}`
      });
    }

    const validExperienceLevels = ['beginner', 'intermediate', 'advanced'];
    if (experience_level !== undefined && !validExperienceLevels.includes(experience_level)) {
      return res.status(400).json({
        success: false,
        message: `Experience level must be one of: ${validExperienceLevels.join(', ')}`
      });
    }

    if (hours_per_week !== undefined && (!Number.isFinite(Number(hours_per_week)) || Number(hours_per_week) < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Hours per week must be a number of at least 1'
      });
    }

    // Update root level fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (target_role !== undefined) user.target_role = target_role;
    if (experience_level !== undefined) user.experience_level = experience_level;
    if (hours_per_week !== undefined) user.hours_per_week = Number(hours_per_week);
    if (learning_style !== undefined) user.learning_style = learning_style;
    if (current_skills !== undefined) user.current_skills = current_skills;

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
        tour_seen: Boolean(updatedUser.tour_seen_at),
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
    const { theme, language, notificationEnabled, weeklyEmail } = req.body;

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
    // Only the flag is writable — lastSentAt is the job's bookkeeping and a
    // client that could set it could suppress its own next email.
    if (typeof weeklyEmail?.enabled === 'boolean') {
      user.weeklyEmail = { ...(user.weeklyEmail || {}), enabled: weeklyEmail.enabled };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        theme: user.theme,
        language: user.language,
        notificationEnabled: user.notificationEnabled,
        weeklyEmail: { enabled: user.weeklyEmail?.enabled ?? false }
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

    // Validated here as well as in updateProfile: this is a separate write
    // path into the same field, and without the check an unsupported role
    // would surface as a 500 from the model's enum rather than a 400.
    if (target_role !== undefined && target_role !== '' && !isCareerRole(target_role)) {
      return res.status(400).json({
        success: false,
        message: `Target role must be one of: ${CAREER_ROLES.join(', ')}`
      });
    }

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

// @desc    Record that the first-run tour has been dismissed
// @route   PUT /api/profile/tour-seen
// @access  Private
//
// Deliberately its own route rather than a field on updateProfile: dismissing
// a tour should not run the whole profile validation path, and it must still
// succeed for an account part-way through setup.
export const markTourSeen = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { tour_seen_at: new Date() } },
      { new: true }
    ).select('tour_seen_at');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: { tour_seen: true } });
  } catch (err) {
    console.error('Mark tour seen error:', err);
    res.status(500).json({ success: false, message: 'Failed to record tour state' });
  }
};

// @desc    Update learning availability
// @route   PUT /api/profile/availability
// @access  Private
export const updateAvailability = async (req, res) => {
  try {
    const { hours_per_week, learning_style } = req.body;

    if (learning_style !== undefined && learning_style !== '' && !isLearningStyle(learning_style)) {
      return res.status(400).json({
        success: false,
        message: `Learning style must be one of: ${LEARNING_STYLES.join(', ')}`
      });
    }

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
