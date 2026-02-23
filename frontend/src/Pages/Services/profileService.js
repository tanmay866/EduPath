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

// Change user password
export const changePassword = async (passwordData) => {
  try {
    const response = await API.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
