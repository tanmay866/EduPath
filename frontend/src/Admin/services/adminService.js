/**
 * The admin API.
 *
 * These screens used to render literal arrays declared inline in each page.
 * Everything here is a real request behind `protect` + `isAdmin`, so a browser
 * that merely has role='admin' in sessionStorage gets the screens but not the
 * data.
 */
const API_BASE = `${import.meta.env.VITE_API_URL}/api/admin`;

const request = async (path, options = {}) => {
  const token = sessionStorage.getItem('token');

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Request failed (${response.status})`);
  }

  return body.data;
};

export const getOverview = () => request('/overview');
export const getUsers = () => request('/users');
export const getAttempts = () => request('/attempts');
export const getRoadmaps = () => request('/roadmaps');
export const getAnalytics = () => request('/analytics');

export const toggleUserBlock = (id) => request(`/users/${id}/block`, { method: 'PATCH' });
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });

export const getSettings = () => request('/settings');
export const updateSettings = (settings) => request('/settings', {
  method: 'PUT',
  body: JSON.stringify(settings),
});
