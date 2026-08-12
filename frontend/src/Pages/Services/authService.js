import API from './assessmentService';

/**
 * The account endpoints, on the shared client.
 *
 * These used to be bare axios calls with the host and the Authorization
 * header written out at each site, which is how they escaped the request
 * interceptor and, later, the expired-token handling in it.
 */

/** The signed-in account, as the API currently sees it. */
export const fetchMe = async () => {
  const { data } = await API.get('/auth/me');
  return data?.user || null;
};

export const login = async (credentials) => {
  const { data } = await API.post('/auth/login', credentials);
  return data;
};

export const signup = async (details) => {
  const { data } = await API.post('/auth/signup', details);
  return data;
};

export const verifyOtp = async (email, otp) => {
  const { data } = await API.post('/auth/verify-otp', { email, otp });
  return data;
};

export const resendOtp = async (email) => {
  const { data } = await API.post('/auth/resend-otp', { email });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await API.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (resetToken, password) => {
  const { data } = await API.post(`/auth/reset-password/${resetToken}`, { password });
  return data;
};

/**
 * Tells the API the session is over.
 *
 * The local session is cleared by the caller whatever happens here — a
 * network failure must not leave somebody who pressed Sign out still signed
 * in on their own machine.
 */
export const logout = async () => {
  try {
    await API.post('/auth/logout');
  } catch {
    // Deliberately ignored; see above.
  }
};
