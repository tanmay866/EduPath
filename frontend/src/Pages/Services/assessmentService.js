import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

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
