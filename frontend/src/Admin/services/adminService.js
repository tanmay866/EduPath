/**
 * The admin API.
 *
 * These screens used to render literal arrays declared inline in each page.
 * Everything here is a real request behind `protect` + `isAdmin`, so a browser
 * that merely has role='admin' in sessionStorage gets the screens but not the
 * data.
 */
import { API_BASE as API_ROOT } from '../../config';

const API_BASE = `${API_ROOT}/admin`;

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

// Feedback queue. The status filter is part of the URL rather than done in
// the page, so a long queue is not fetched whole to show a slice of it.
export const getFeedback = (status = 'new') =>
  request(`/feedback${status && status !== 'all' ? `?status=${status}` : ''}`);

export const updateFeedback = (id, patch) => request(`/feedback/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(patch),
});

export const getSettings = () => request('/settings');
export const updateSettings = (settings) => request('/settings', {
  method: 'PUT',
  body: JSON.stringify(settings),
});
