import API from './assessmentService';

/** Saved AI mock interview results — mounted under /api/mock-interview. */
export const saveInterviewResult = (payload) => API.post('/mock-interview/results', payload);

export const getInterviewHistory = () => API.get('/mock-interview/results');

export const getInterviewResult = (resultId) => API.get(`/mock-interview/results/${resultId}`);
