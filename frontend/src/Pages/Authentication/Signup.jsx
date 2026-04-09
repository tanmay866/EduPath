import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { Eye, EyeOff } from 'lucide-react';
import { useFormik } from 'formik';
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
        const response = await axios.post('http://localhost:4000/api/auth/signup', values);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040a] pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 backdrop-blur-3xl bg-[#090b14]/70 p-10 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.05)] border border-white/5 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
        >
          <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-white tracking-tight">
            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Account</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Join EduPath today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit} noValidate>
          <div className="rounded-md shadow-sm space-y-4">
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
                  className={`appearance-none relative block w-full px-4 py-3 border ${formik.errors.firstName ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20'} placeholder-slate-500 text-white bg-[#0a0a0a]/50 rounded-xl focus:outline-none focus:ring-4 transition-all`}
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
                  className={`appearance-none relative block w-full px-4 py-3 border ${formik.errors.lastName ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20'} placeholder-slate-500 text-white bg-[#0a0a0a]/50 rounded-xl focus:outline-none focus:ring-4 transition-all`}
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
                className={`appearance-none relative block w-full px-4 py-3 border ${formik.errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20'} placeholder-slate-500 text-white bg-[#0a0a0a]/50 rounded-xl focus:outline-none focus:ring-4 transition-all`}
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
                  className={`appearance-none relative block w-full px-4 py-3 pr-11 border ${formik.errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20'} placeholder-slate-500 text-white bg-[#0a0a0a]/50 rounded-xl focus:outline-none focus:ring-4 transition-all`}
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
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40"
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
    </div>
  );
};

export default Signup;
