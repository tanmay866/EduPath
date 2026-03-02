import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { Eye, EyeOff } from 'lucide-react';
import { useFormik } from 'formik';
import axios from 'axios';
import { toast } from 'react-toastify';
import { forgotPassword } from '../Services/profileService';

const Signin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: ""
    },

    validate: (values) => {
      const errors = {};

      if (!values.identifier) {
        errors.identifier = 'Email or Login ID is required';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      }
      return errors;
    },
    onSubmit: async (values, { resetForm }) => {

      // Simulate API call
      try {

        let payload = {
          password: values.password
        }

        // detect email or loginId
        if (values.identifier.includes('@')) {
          payload.email = values.identifier;
        } else {
          payload.loginId = values.identifier;
        }

        console.log("Payload", payload);


        const res = await axios.post('http://localhost:4000/api/auth/login', payload);
        console.log(res);
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("userId", res.data.user.id);
        sessionStorage.setItem("email", res.data.user.email);
        sessionStorage.setItem("loginId", res.data.user.loginId);
        sessionStorage.setItem("role", res.data.user.role);
        sessionStorage.setItem("firstName", res.data.user.firstName);
        sessionStorage.setItem("lastName", res.data.user.lastName);
        sessionStorage.setItem("phone", res.data.user.phone || '');
        sessionStorage.setItem("skills", res.data.user.skills || '');
        
        // Profile picture is stored ONLY in Cloudinary, construct URL from userId
        // Check sessionStorage first, then construct from Cloudinary
        const storedPicture = sessionStorage.getItem("profilePicture");
        if (!storedPicture && res.data.user.id) {
          const cloudinaryUrl = `https://res.cloudinary.com/dmk1ekxzf/image/upload/w_300,h_300,c_fill,g_face,q_auto/edupath/profile-pictures/${res.data.user.id}`;
          sessionStorage.setItem("profilePicture", cloudinaryUrl);
        }
        
        // Notify other components that sessionStorage has been updated
        window.dispatchEvent(new Event('sessionStorageUpdated'));
        
        toast.success('Signin successful!');
        resetForm();

        const userRole = res.data.user.role;
        if (userRole === 'admin') {
          setTimeout(() => {
            navigate('/admin');
            window.location.reload();
          }, 1000);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Signin error:', error);
        toast.error(error.response?.data?.message || 'Signin failed. Please try again.');
      }
    }
  });

  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isValid) {
      toast.error("Please fill all required fields correctly");
    }
  }, [formik.submitCount]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    // Get email from identifier field
    const identifier = formik.values.identifier;

    // Check if identifier contains @ (is email)
    if (!identifier) {
      toast.error('Please enter your email address');
      return;
    }

    if (!identifier.includes('@')) {
      toast.error('Please enter a valid email address (not Login ID)');
      return;
    }

    try {
      const response = await forgotPassword(identifier);
      toast.success(response.message || 'Password reset email sent successfully! Please check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Live Moving Background Animations */}
      <div className="animated-bg">
        {/* Moving Shapes */}
        <div className="moving-shape shape-1"></div>
        <div className="moving-shape shape-2"></div>
        <div className="moving-shape shape-3"></div>
        <div className="moving-shape shape-4"></div>
        <div className="moving-shape shape-5"></div>
        <div className="moving-shape shape-6"></div>
        <div className="moving-shape shape-7"></div>
        <div className="moving-shape shape-8"></div>

        {/* Rotating Center Gradient */}
        <div className="rotating-gradient"></div>

        {/* Floating Particles */}
        <div className="floating-particle" style={{ top: '5%', left: '15%', animationDelay: '0s' }}></div>
        <div className="floating-particle" style={{ top: '8%', left: '85%', animationDelay: '2s' }}></div>
        <div className="floating-particle" style={{ top: '12%', left: '50%', animationDelay: '1.5s' }}></div>
        <div className="floating-particle" style={{ top: '15%', left: '20%', animationDelay: '0s' }}></div>
        <div className="floating-particle" style={{ top: '25%', left: '70%', animationDelay: '1s' }}></div>
        <div className="floating-particle" style={{ top: '45%', left: '10%', animationDelay: '2s' }}></div>
        <div className="floating-particle" style={{ top: '55%', left: '85%', animationDelay: '1.5s' }}></div>
        <div className="floating-particle" style={{ top: '75%', left: '30%', animationDelay: '0.5s' }}></div>
        <div className="floating-particle" style={{ top: '65%', left: '60%', animationDelay: '2.5s' }}></div>
        <div className="floating-particle" style={{ top: '35%', left: '50%', animationDelay: '3s' }}></div>
        <div className="floating-particle" style={{ top: '85%', left: '75%', animationDelay: '1.2s' }}></div>
      </div>
      <div className="max-w-md w-full space-y-8 backdrop-blur-xl bg-slate-900/60 p-10 rounded-2xl shadow-2xl border border-white/10 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
        >
          <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Sign in to your EduPath account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit} noValidate>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address / Login ID
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={formik.values.identifier}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`appearance-none relative block w-full px-3 py-3 border ${formik.errors.identifier ? 'border-red-500' : 'border-slate-700'} placeholder-gray-500 text-white bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="john@example.com / MEPA2026002"
              />
              {formik.touched.identifier && formik.errors.identifier && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.identifier}
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
                  className={`appearance-none relative block w-full px-3 py-3 pr-11 border ${formik.errors.password ? 'border-red-500' : 'border-slate-700'} placeholder-gray-500 text-white bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
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

          <div className="flex items-center justify-between">
            {/* <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-600 bg-slate-700 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div> */}

            <div className="text-sm">
              <a
                href="#"
                onClick={handleForgotPassword}
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-300">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;
