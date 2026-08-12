import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

import API from '../Services/assessmentService';
import { AuthProvider } from '../Context/AuthContext';
import { useAuth } from '../Context/useAuth';
import { resetRedirectLatch } from '../../utils/protectedRoutes';
import Signup from './Signup';
import Signin from './Signin';
import VerifyEmail from './VerifyEmail';
import ResetPassword from './ResetPassword';
import RequiresAuth from '../../component/RequiresAuth';

/**
 * The account journey, driven through the real screens.
 *
 * These go through the components rather than calling the services, because
 * the bugs worth catching here are in the wiring: what gets stored after
 * verification, where each step navigates, and whether an expired token is
 * told apart from a wrong password. None of that shows up in a unit test of
 * the request functions.
 *
 * The network is stubbed at the axios adapter, one level below the
 * interceptors, so the request and response interceptors under test are the
 * real ones — including the expired-session handling, which is the whole
 * point of two of these cases.
 */

/** Queued replies, matched on method and URL. */
let routes;

const reply = (method, url, response) => {
  routes.push({ method: method.toLowerCase(), url, response });
};

const axiosError = (config, status, data) => {
  const error = new Error(data?.message || `Request failed with status ${status}`);
  error.config = config;
  error.isAxiosError = true;
  error.response = { status, data, config, headers: {} };
  return error;
};

/**
 * A mock adapter has to settle for itself — axios does not re-check the status
 * of whatever an adapter resolves with — so anything at or above 400 is
 * rejected here in the shape the interceptors read.
 */
const adapter = (config) => {
  const match = routes.find(
    (r) => r.method === (config.method || 'get').toLowerCase() && config.url === r.url
  );

  if (!match) {
    return Promise.reject(axiosError(config, 404, { message: `No stub for ${config.method} ${config.url}` }));
  }

  const { status = 200, data = {} } = match.response;
  if (status >= 400) return Promise.reject(axiosError(config, status, data));

  return Promise.resolve({ status, data, config, headers: {}, statusText: 'OK' });
};

/** Reports the current path so navigation can be asserted on. */
const Where = () => {
  const location = useLocation();
  return <div data-testid="path">{location.pathname + location.search}</div>;
};

const Protected = () => <div>the protected page</div>;

const renderApp = (initialEntry, extraRoutes = null) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Where />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/onboarding" element={<div>onboarding</div>} />
          <Route path="/assessment" element={<div>the app</div>} />
          <Route path="/" element={<div>home</div>} />
          {extraRoutes}
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

let originalAdapter;

beforeEach(() => {
  routes = [];
  originalAdapter = API.defaults.adapter;
  API.defaults.adapter = adapter;
  resetRedirectLatch();
});

afterEach(() => {
  API.defaults.adapter = originalAdapter;
});

const VERIFIED_USER = {
  id: 'u1',
  email: 'learner@example.com',
  loginId: 'TAPA2026001',
  role: 'student',
  firstName: 'Alex',
  lastName: 'Doe',
  profile_complete: false,
};

describe('signup', () => {
  test('sends the learner to the code step, carrying the address', async () => {
    reply('post', '/auth/signup', { status: 201, data: { message: 'Check your email.' } });
    const user = userEvent.setup();

    renderApp('/signup');

    await user.type(screen.getByLabelText(/first name/i), 'Alex');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'learner@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Str0ng!passw0rd');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Verification is the next step, not sign-in: the account cannot be used
    // until the code is entered, so offering a login form would be a dead end.
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/verify-email'));
    expect(screen.getByText(/learner@example\.com/)).toBeInTheDocument();
  });

  test('a refused signup keeps the form and says why', async () => {
    reply('post', '/auth/signup', { status: 400, data: { message: 'Email already registered' } });
    const user = userEvent.setup();

    renderApp('/signup');

    await user.type(screen.getByLabelText(/first name/i), 'Alex');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'taken@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Str0ng!passw0rd');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // The message appears twice on purpose — once on the form, once as a
    // toast — so this asserts it is shown rather than shown exactly once.
    expect((await screen.findAllByText(/already registered/i)).length).toBeGreaterThan(0);
    expect(screen.getByTestId('path')).toHaveTextContent('/signup');
  });

  test('the journey shows this as the first of three steps', () => {
    renderApp('/signup');
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
  });
});

describe('OTP verification', () => {
  const atVerify = () =>
    render(
      <MemoryRouter initialEntries={[{ pathname: '/verify-email', state: { email: 'learner@example.com' } }]}>
        <AuthProvider>
          <Where />
          <Routes>
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/onboarding" element={<div>onboarding</div>} />
            <Route path="/" element={<div>home</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

  test('a correct code signs the user in and starts onboarding', async () => {
    reply('post', '/auth/verify-otp', {
      status: 200,
      data: { token: 'jwt-abc', user: VERIFIED_USER, message: 'Verified.' },
    });
    const user = userEvent.setup();

    atVerify();
    await user.type(screen.getByLabelText(/code/i), '123456');
    await user.click(screen.getByRole('button', { name: /verify/i }));

    // Verifying used to store only the token and role, which left the account
    // half signed in and bounced straight back to /signin.
    await waitFor(() => expect(sessionStorage.getItem('token')).toBe('jwt-abc'));
    expect(sessionStorage.getItem('email')).toBe('learner@example.com');
    expect(sessionStorage.getItem('loginId')).toBe('TAPA2026001');

    // A new account has no role yet, so onboarding is next rather than home.
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/onboarding'));
  });

  test('a wrong code stays put and stores nothing', async () => {
    reply('post', '/auth/verify-otp', { status: 400, data: { message: 'Invalid or expired code' } });
    const user = userEvent.setup();

    atVerify();
    await user.type(screen.getByLabelText(/code/i), '000000');
    await user.click(screen.getByRole('button', { name: /verify/i }));

    expect(await screen.findByText(/invalid or expired code/i)).toBeInTheDocument();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('path')).toHaveTextContent('/verify-email');
  });

  test('is the second of three steps', () => {
    atVerify();
    expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();
  });
});

describe('login', () => {
  test('a complete profile goes to the app and stores the session', async () => {
    reply('post', '/auth/login', {
      status: 200,
      data: { token: 'jwt-xyz', user: { ...VERIFIED_USER, profile_complete: true, target_role: 'MERN Developer' } },
    });
    const user = userEvent.setup();

    renderApp('/signin');
    await user.type(screen.getByLabelText(/email or login id/i), 'learner@example.com');
    await user.type(screen.getByLabelText(/password/i), 'whatever1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/assessment'));
    expect(sessionStorage.getItem('token')).toBe('jwt-xyz');
    expect(sessionStorage.getItem('profileComplete')).toBe('1');
  });

  test('an incomplete profile is sent to onboarding first', async () => {
    reply('post', '/auth/login', {
      status: 200,
      data: { token: 'jwt-xyz', user: { ...VERIFIED_USER, profile_complete: false } },
    });
    const user = userEvent.setup();

    renderApp('/signin');
    await user.type(screen.getByLabelText(/email or login id/i), 'learner@example.com');
    await user.type(screen.getByLabelText(/password/i), 'whatever1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/onboarding'));
  });

  test('finishes the trip the guard interrupted', async () => {
    reply('post', '/auth/login', {
      status: 200,
      data: { token: 'jwt-xyz', user: { ...VERIFIED_USER, profile_complete: true } },
    });
    const user = userEvent.setup();

    renderApp('/signin?next=%2Fjob-fit');
    await user.type(screen.getByLabelText(/email or login id/i), 'learner@example.com');
    await user.type(screen.getByLabelText(/password/i), 'whatever1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/job-fit'));
  });

  test('an off-site next is refused', async () => {
    reply('post', '/auth/login', {
      status: 200,
      data: { token: 'jwt-xyz', user: { ...VERIFIED_USER, profile_complete: true } },
    });
    const user = userEvent.setup();

    // A protocol-relative URL in the query string would otherwise send someone
    // to another host the moment they signed in.
    renderApp('/signin?next=%2F%2Fevil.example');
    await user.type(screen.getByLabelText(/email or login id/i), 'learner@example.com');
    await user.type(screen.getByLabelText(/password/i), 'whatever1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/assessment'));
  });

  test('a wrong password is reported, never treated as an expired session', async () => {
    // The API answers 401 for bad credentials and for a dead token alike.
    // Confusing the two here would clear the session and redirect to the very
    // page the user is already on, wiping the form instead of explaining.
    reply('post', '/auth/login', { status: 401, data: { message: 'Invalid credentials' } });
    const user = userEvent.setup();

    renderApp('/signin');
    await user.type(screen.getByLabelText(/email or login id/i), 'learner@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/signin');
  });

  test('explains itself when sent here by an expired session', () => {
    renderApp('/signin?expired=1');
    expect(screen.getByText(/your session ended/i)).toBeInTheDocument();
  });
});

describe('password reset', () => {
  test('a good token lands on sign-in without a half-built session', async () => {
    // The API returns a token here but no user with it. Storing the token
    // alone left someone signed in enough for RequiresAuth and not enough for
    // RequiresProfile, which bounced them between onboarding and sign-in.
    sessionStorage.setItem('token', 'old-jwt');
    reply('post', '/auth/reset-password/tok123', {
      status: 200,
      data: { success: true, message: 'Password updated.', token: 'fresh-jwt' },
    });
    const user = userEvent.setup();

    renderApp('/reset-password/tok123');
    await user.type(screen.getByLabelText(/^new password$/i), 'Str0ng!passw0rd');
    await user.type(screen.getByLabelText(/confirm new password/i), 'Str0ng!passw0rd');
    await user.click(screen.getByRole('button', { name: /save new password/i }));

    await waitFor(() => expect(sessionStorage.getItem('token')).toBeNull());
    // The screen waits before moving, so this outlasts that pause.
    await waitFor(
      () => expect(screen.getByTestId('path')).toHaveTextContent('/signin'),
      { timeout: 3000 }
    );
  });

  test('mismatched passwords never reach the API', async () => {
    const user = userEvent.setup();

    renderApp('/reset-password/tok123');
    await user.type(screen.getByLabelText(/^new password$/i), 'Str0ng!passw0rd');
    await user.type(screen.getByLabelText(/confirm new password/i), 'Str0ng!different');
    await user.click(screen.getByRole('button', { name: /save new password/i }));

    expect(await screen.findByText(/do not match/i)).toBeInTheDocument();
    // No stub was registered, so a request would have failed the test anyway —
    // this asserts the intent rather than relying on that.
    expect(screen.getByTestId('path')).toHaveTextContent('/reset-password/tok123');
  });
});

describe('an expired session', () => {
  test('is cleared centrally when the API refuses a protected request', async () => {
    sessionStorage.setItem('token', 'stale-jwt');
    reply('get', '/auth/me', { status: 401, data: { message: 'Token is invalid or has expired.' } });

    renderApp('/');

    // The opening refresh is what discovers it. Nothing else had to notice.
    await waitFor(() => expect(sessionStorage.getItem('token')).toBeNull());
  });

  test('turns a protected page away rather than rendering it', async () => {
    sessionStorage.setItem('token', 'stale-jwt');
    reply('get', '/auth/me', { status: 401, data: { message: 'expired' } });

    renderApp('/private', <Route path="/private" element={<RequiresAuth><Protected /></RequiresAuth>} />);

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/signin'));
    expect(screen.queryByText('the protected page')).not.toBeInTheDocument();
  });

  test('a network failure does not sign anybody out', async () => {
    // Offline, or a sleeping backend. Signing somebody out because their train
    // went into a tunnel is worse than showing slightly stale details.
    sessionStorage.setItem('token', 'good-jwt');
    sessionStorage.setItem('email', 'learner@example.com');
    API.defaults.adapter = (config) => {
      const error = new Error('Network Error');
      error.config = config;
      error.isAxiosError = true;
      error.request = {};
      return Promise.reject(error);
    };

    renderApp('/');

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/'));
    expect(sessionStorage.getItem('token')).toBe('good-jwt');
  });
});

describe('sign out', () => {
  const SignOutButton = () => {
    const { signOut, isAuthenticated } = useAuth();
    return (
      <div>
        <span>{isAuthenticated ? 'signed in' : 'signed out'}</span>
        <button type="button" onClick={signOut}>Sign out</button>
      </div>
    );
  };

  test('clears every session key, not the handful a screen remembers', async () => {
    sessionStorage.setItem('token', 'jwt');
    sessionStorage.setItem('email', 'learner@example.com');
    sessionStorage.setItem('firstName', 'Alex');
    sessionStorage.setItem('targetRole', 'MERN Developer');
    sessionStorage.setItem('profileComplete', '1');
    reply('get', '/auth/me', { status: 200, data: { user: VERIFIED_USER } });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthProvider><SignOutButton /></AuthProvider>
      </MemoryRouter>
    );

    await screen.findByText('signed in');
    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(await screen.findByText('signed out')).toBeInTheDocument();
    for (const key of ['token', 'email', 'firstName', 'targetRole', 'profileComplete']) {
      expect(sessionStorage.getItem(key), key).toBeNull();
    }
  });
});

describe('the opening refresh', () => {
  test('corrects a stale profileComplete instead of trusting the copy', async () => {
    // Onboarding finished in another tab. The flag here still says no, and
    // acting on it would send a set-up learner back through setup.
    sessionStorage.setItem('token', 'jwt');
    sessionStorage.setItem('profileComplete', '0');
    reply('get', '/auth/me', {
      status: 200,
      data: { user: { ...VERIFIED_USER, profile_complete: true, target_role: 'DevOps Engineer' } },
    });

    renderApp('/');

    await waitFor(() => expect(sessionStorage.getItem('profileComplete')).toBe('1'));
    expect(sessionStorage.getItem('targetRole')).toBe('DevOps Engineer');
  });

  test('does not blank fields /me leaves out', async () => {
    // /api/auth/me returns no phone and no skills. Writing the whole session
    // from it would empty both on every page load.
    sessionStorage.setItem('token', 'jwt');
    sessionStorage.setItem('phone', '9876543210');
    sessionStorage.setItem('skills', 'React, Node');
    reply('get', '/auth/me', { status: 200, data: { user: VERIFIED_USER } });

    renderApp('/');

    await waitFor(() => expect(sessionStorage.getItem('firstName')).toBe('Alex'));
    expect(sessionStorage.getItem('phone')).toBe('9876543210');
    expect(sessionStorage.getItem('skills')).toBe('React, Node');
  });

  test('a signed-out visitor is never asked about', async () => {
    // No token, so no request — a marketing page must not wait on one.
    const seen = [];
    API.defaults.adapter = (config) => {
      seen.push(config.url);
      return Promise.resolve({ status: 200, data: {}, config, headers: {} });
    };

    renderApp('/');

    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument());
    expect(seen).not.toContain('/auth/me');
  });
});
