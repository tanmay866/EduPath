import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiErrorMessage } from '../../utils/passwordPolicy';

const API_URL = import.meta.env.VITE_API_URL;
const RESEND_COOLDOWN_SECONDS = 60;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const spotlightBackground = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(6,182,212,0.15), transparent 80%)`;

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
    <div className="min-h-screen flex bg-[#02040a] pt-16 pb-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden" onMouseMove={handleMouseMove}>

      {/* Interactive Cursor Spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: spotlightBackground }}
      />
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Side: Brand Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative z-10">
        <motion.div
          className="max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.button variants={itemVariants} onClick={() => navigate('/')} className="inline-flex items-center gap-2 mb-8 group focus:outline-none">
            <HiArrowLeft className="w-5 h-5 text-gray-400 group-hover:-translate-x-1 transition-transform group-hover:text-cyan-400" />
            <span className="text-sm font-medium text-gray-400 group-hover:text-cyan-400 transition-colors">Back to Home</span>
          </motion.button>

          <motion.h1 variants={itemVariants} className="text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            One Last Step <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Confirm It&apos;s You</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-base text-slate-400 mb-8 leading-relaxed">
            We sent a six-digit code to your inbox. Verifying your email keeps your roadmaps, resumes and assessments tied to an address only you control.
          </motion.p>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mb-3 border border-cyan-500/20">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Check Your Inbox</h3>
              <p className="text-slate-400 text-xs">The code arrives in seconds and stays valid for 10 minutes.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 border border-blue-500/20">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Account Recovery</h3>
              <p className="text-slate-400 text-xs">A verified address is how you get back in if you forget your password.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side: Form Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="flex-1 flex items-center justify-center w-full relative z-10"
      >
        <div className="max-w-md w-full space-y-6 backdrop-blur-3xl bg-[#090b14]/80 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.1)] border border-white/10 relative">
          {/* Mobile Back Button */}
          <button onClick={() => navigate('/')} className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group focus:outline-none">
            <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
              Verify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Email</span>
            </h2>
            <p className="mt-1 text-center text-sm text-slate-400">
              Enter the 6-digit code sent to
            </p>
            <p className="text-center text-sm font-medium text-white break-all">{email}</p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleVerify} noValidate>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                Verification Code
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
                className="appearance-none relative block w-full px-4 py-2.5 border border-white/5 placeholder-slate-600 text-white bg-[#0a0a0a]/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-center text-2xl font-mono tracking-[0.5em]"
                placeholder="000000"
              />
              <p className="mt-1.5 text-xs text-slate-500">The code expires in 10 minutes.</p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-slate-400">
              Didn&apos;t receive it?{' '}
              <button
                onClick={handleResend}
                disabled={cooldown > 0}
                className="font-medium text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </p>
            <p className="text-sm text-slate-400">
              Already verified?{' '}
              <Link to="/signin" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
