import axios from "axios";
import { API_BASE } from "../../config";

// Resolved centrally in config.js so every caller agrees on the host and a
// missing VITE_API_URL is reported once rather than silently producing
// "undefined/api/..." in a production build.
const API_BASE_URL = API_BASE;

const API = axios.create({
  baseURL: API_BASE_URL,
});

// 🔥 Wake up Render backend on app load (free tier sleeps after inactivity)
fetch(`${API_BASE_URL.replace('/api', '')}/health`).catch(() => {});

API.interceptors.request.use((req) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// Fetch all avliable quiz topics
export const fetchQuizTopics = () => API.get('/quiz/topics');

// Start/Generate Quiz
export const startQuiz = (payload) => API.post('/quiz/start', payload);

// Get Quiz Session
export const getQuizSession = (sessionId) => API.get(`/quiz/session/${sessionId}`);

// Submit Quiz Answers
export const submitQuiz = (payload) => API.post('/quiz/submit', payload);

// Get Quiz Result
export const getQuizResult = (resultId) => API.get(`/quiz/result/${resultId}`);

// Retry Quiz
export const retryQuiz = (resultId) => API.post(`/quiz/result/${resultId}/retry`);

// Abandon Quiz Session
export const abandonQuizSession = (sessionId) => API.put(`/quiz/session/${sessionId}/abandon`);

// Get Quiz History
export const getQuizHistory = () => API.get('/quiz/history');

// Get Quiz Stats
export const getQuizStats = () => API.get('/quiz/stats');

export default API;
