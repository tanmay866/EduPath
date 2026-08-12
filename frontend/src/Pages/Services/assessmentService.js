import axios from "axios";
import { API_BASE } from "../../config";
import { clearSession } from "../../utils/session";
import { requiresAuth, redirectToSignIn } from "../../utils/protectedRoutes";

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

/**
 * Endpoints where 401 means "that password was wrong", not "your session
 * ended".
 *
 * This distinction is the whole difficulty of handling expiry centrally. The
 * API answers 401 for a dead token *and* for bad credentials — Invalid
 * credentials on login, Current password is incorrect on a change, and the
 * password confirmation on account deletion. Treating those as expiry would
 * sign a user out for mistyping their own password, and on the login screen
 * it would replace "Invalid credentials" with a redirect back to the page
 * they are already looking at.
 *
 * Requests sent without a token are excluded on top of this, which covers
 * login, verification and the password-reset pair without naming them: no
 * token means there was no session to expire.
 */
const CREDENTIAL_CHECKS = ['/auth/change-password', '/auth/account'];

const isSessionExpiry = (error) => {
  if (error?.response?.status !== 401) return false;

  const config = error.config || {};
  // No Authorization header means nothing expired — this was an anonymous
  // request that was refused, and the screen should show the message.
  if (!config.headers?.Authorization) return false;

  const url = config.url || '';
  return !CREDENTIAL_CHECKS.some((path) => url.startsWith(path));
};

/**
 * One place where an expired session is handled.
 *
 * There was none. A token that ran out produced whatever each of the callers
 * happened to do with a rejected promise — usually a toast about a failure
 * that was not really a failure, on a page that then sat there empty.
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isSessionExpiry(error)) {
      clearSession();

      // Only move them if they are somewhere that needs a session. Expiring
      // while reading the FAQ should quietly sign them out, not throw them
      // onto a sign-in screen they never asked for.
      if (requiresAuth(window.location.pathname)) {
        redirectToSignIn(window.location.pathname + window.location.search);
      }
    }

    return Promise.reject(error);
  }
);

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

/**
 * Keep the server's copy of a part-finished quiz up to date.
 *
 * Answers only — the score is still worked out on submit from the questions
 * the server holds, so this cannot award marks. It exists so that closing the
 * tab does not throw away the answers already given.
 */
export const saveQuizProgress = (sessionId, { answers, markedForReview }) =>
  API.put(`/quiz/session/${sessionId}/progress`, { answers, markedForReview });

// Get Quiz History
export const getQuizHistory = () => API.get('/quiz/history');

// Get Quiz Stats
export const getQuizStats = () => API.get('/quiz/stats');

/** Topics due for another look, most overdue first. */
export const getReviewQueue = () => API.get('/quiz/review-queue');

export default API;
