import API from './assessmentService';

export const generateRoadmap = async () => {
  try {
    const response = await API.post('/roadmap/generate');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/** The active roadmap for the role the learner is currently working towards. */
export const getRoadmap = async () => {
  try {
    const response = await API.get('/roadmap');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRoadmapHistory = async () => {
  try {
    const response = await API.get('/roadmap/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRoadmapById = async (roadmapId) => {
  try {
    const response = await API.get(`/roadmap/${roadmapId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSkillStatus = async (skill, status) => {
  try {
    const response = await API.patch('/roadmap/skill-status', { skill, status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/** Tick or untick one task in a week of the active roadmap. */
export const updateTaskStatus = async (weekNumber, taskIndex, done) => {
  try {
    const response = await API.patch('/roadmap/task-status', {
      week_number: weekNumber,
      task_index: taskIndex,
      done,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateRoadmapSkillsProfile = async (payload) => {
  try {
    const response = await API.put('/profile/skills', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateRoadmapAvailability = async (payload) => {
  try {
    const response = await API.put('/profile/availability', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
