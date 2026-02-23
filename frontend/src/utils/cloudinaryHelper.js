/**
 * Utility functions for Cloudinary profile pictures
 * Since profile pictures are stored ONLY in Cloudinary (not MongoDB),
 * we need to construct the URL based on user ID
 */

const CLOUDINARY_CLOUD_NAME = 'dmk1ekxzf';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Get profile picture URL from Cloudinary based on user ID
 * @param {string} userId - The MongoDB user ID
 * @returns {string} The Cloudinary URL for the user's profile picture
 */
export const getProfilePictureUrl = (userId) => {
  if (!userId) return '';
  return `${CLOUDINARY_BASE_URL}/w_300,h_300,c_fill,g_face,q_auto/edupath/profile-pictures/${userId}`;
};

/**
 * Check if a profile picture exists in Cloudinary
 * @param {string} url - The Cloudinary URL to check
 * @returns {Promise<boolean>} True if image exists, false otherwise
 */
export const checkProfilePictureExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Get profile picture with fallback
 * Priority: SessionStorage > Cloudinary (by userId) > Empty string
 * @param {string} userId - The MongoDB user ID
 * @returns {string} The profile picture URL or empty string
 */
export const getProfilePictureWithFallback = (userId) => {
  // First check sessionStorage
  const sessionPicture = sessionStorage.getItem('profilePicture');
  if (sessionPicture) {
    return sessionPicture;
  }
  
  // Fallback to Cloudinary URL by userId
  if (userId) {
    return getProfilePictureUrl(userId);
  }
  
  return '';
};

export default {
  getProfilePictureUrl,
  checkProfilePictureExists,
  getProfilePictureWithFallback
};
