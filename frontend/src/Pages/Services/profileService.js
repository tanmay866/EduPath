import API from './assessmentService';

// Get current user profile
export const getProfile = async () => {
  try {
    const response = await API.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await API.put('/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user settings
export const updateSettings = async (settings) => {
  try {
    const response = await API.put('/profile/settings', settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Upload profile picture to Cloudinary
export const uploadProfilePicture = async (imageData) => {
  try {
    const response = await API.post('/profile/upload-picture', { imageData });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete profile picture
export const deleteProfilePicture = async () => {
  try {
    const response = await API.delete('/profile/delete-picture');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Change user password
export const changePassword = async (passwordData) => {
  try {
    const response = await API.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Forgot password - Send reset email
export const forgotPassword = async (email) => {
  try {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reset password with token
export const resetPassword = async (token, passwordData) => {
  try {
    const response = await API.post(`/auth/reset-password/${token}`, passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
