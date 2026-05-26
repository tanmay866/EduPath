import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { Eye, EyeOff } from 'lucide-react';
import { useFormik } from 'formik';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "student",
    },

    validate: (values) => {
      const errors = {};

      if (!values.firstName) {
        errors.firstName = 'First name is required';
      }
      if (!values.lastName) {
        errors.lastName = 'Last name is required';
      }
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      return errors;
    },
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      console.log(values);
      try {
        const response = await axios.post('' + import.meta.env.VITE_API_URL + '/api/auth/signup', values);
        console.log("user created");

        console.log('Signup response:', response.data);
        toast.success('Signup successful! Please sign in.');
        resetForm();
        navigate('/signin');
      } catch (error) {
        console.error('Signup error:', error);
        toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }


  });

  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isValid) {
      toast.error("Please fill all required fields correctly");
    }
  }, [formik.submitCount]);

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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const spotlightBackground = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(6,182,212,0.15), transparent 80%)`;

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
            Start Your Journey <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">With EduPath</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-base text-slate-400 mb-8 leading-relaxed">
            Create an account to unlock tailored learning roadmaps, expert guidance, and AI-driven assessments designed to accelerate your career.
          </motion.p>
          
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mb-3 border border-cyan-500/20">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Smart Learning</h3>
              <p className="text-slate-400 text-xs">Access curated content and personalized resources.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 border border-blue-500/20">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Career Tracking</h3>
              <p className="text-slate-400 text-xs">Monitor your progress and achieve your milestones.</p>
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
            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Account</span>
          </h2>
          <p className="mt-1 text-center text-sm text-slate-400">
            Join EduPath today
          </p>
        </div>
        <form className="mt-6 space-y-5" onSubmit={formik.handleSubmit} noValidate>
          <div className="rounded-md shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`appearance-none relative block w-full px-4 py-2.5 border ${formik.errors.firstName ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20'} placeholder-slate-500 text-white bg-[#0a0a0a]/50 rounded-xl focus:outline-none focus:ring-4 transition-all`}
                  placeholder="John"
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`appearance-none relative block w-full px-4 py-2.5 border ${formik.errors.lastName ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20'} placeholder-slate-500 text-white bg-[#0a0a0a]/50 rounded-xl focus:outline-none focus:ring-4 transition-all`}
                  placeholder="Doe"
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`appearance-none relative block w-full px-4 py-2.5 border ${formik.errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20'} placeholder-slate-500 text-white bg-[#0a0a0a]/50 rounded-xl focus:outline-none focus:ring-4 transition-all`}
                placeholder="john@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`appearance-none relative block w-full px-4 py-2.5 pr-11 border ${formik.errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20'} placeholder-slate-500 text-white bg-[#0a0a0a]/50 rounded-xl focus:outline-none focus:ring-4 transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              {formik.isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
