import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { MailCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiErrorMessage } from '../../utils/passwordPolicy';

const API_URL = import.meta.env.VITE_API_URL;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Email verification step.
 *
 * Reached after signup, or from sign-in when the account exists but has not
 * been verified. The address arrives via router state so the user does not have
 * to retype it; if it is missing we send them back rather than guessing.
 */
const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate('/signup', { replace: true });
      return;
    }
    inputRef.current?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code from your email');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });

      if (data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role', data.user?.role || 'student');
      }

      toast.success(data.message || 'Email verified!');
      navigate('/');
    } catch (error) {
      toast.error(getApiErrorMessage(error.response?.data, 'Verification failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
      toast.success(data.message || 'A new code is on its way.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toast.error(getApiErrorMessage(error.response?.data, 'Could not resend the code.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 backdrop-blur-xl bg-slate-900/60 p-10 rounded-2xl shadow-2xl border border-white/10">
        <button
          onClick={() => navigate('/signup')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <HiArrowLeft /> Back
        </button>

        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
            <MailCheck className="text-indigo-400" size={26} />
          </div>
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="mt-2 text-sm text-gray-400">
            We sent a 6-digit code to <span className="text-white">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
              Verification code
            </label>
            <input
              id="otp"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-white/20 placeholder-gray-600 text-white bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="000000"
            />
            <p className="mt-2 text-xs text-gray-500">The code expires in 10 minutes.</p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Didn&apos;t get it?{' '}
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
          <p className="mt-3 text-xs text-gray-500">
            Already verified? <Link to="/signin" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
