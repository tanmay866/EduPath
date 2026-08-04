import API from './assessmentService';

/**
 * Results for the practice tests that don't run against a topic-backed
 * question bank — Aptitude and CS Fundamentals — kept separate from
 * assessmentService's topic-quiz endpoints since they hit a different
 * backend model.
 */
export const savePracticeResult = (payload) => API.post('/practice/results', payload);

export const getPracticeHistory = (type) => API.get('/practice/results', { params: { type } });

export const getPracticeResult = (resultId) => API.get(`/practice/results/${resultId}`);
