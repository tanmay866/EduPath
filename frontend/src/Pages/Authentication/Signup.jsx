import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { useFormik } from 'formik';
import axios from 'axios';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const formik  = useFormik({
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
    onSubmit: async (values,{resetForm, setSubmitting}) => {
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 pt-32 pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
        <div className="floating-particle" style={{top: '5%', left: '15%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '8%', left: '85%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '12%', left: '50%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '15%', left: '20%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '25%', left: '70%', animationDelay: '1s'}}></div>
        <div className="floating-particle" style={{top: '45%', left: '10%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '55%', left: '85%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '75%', left: '30%', animationDelay: '0.5s'}}></div>
        <div className="floating-particle" style={{top: '65%', left: '60%', animationDelay: '2.5s'}}></div>
        <div className="floating-particle" style={{top: '35%', left: '50%', animationDelay: '3s'}}></div>
        <div className="floating-particle" style={{top: '85%', left: '75%', animationDelay: '1.2s'}}></div>
      </div>
      <div className="max-w-md w-full space-y-4 bg-slate-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
        >
          <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <div className="pt-4">
          <h2 className="text-center text-3xl font-extrabold text-white">
            Create Account
          </h2>
          <p className="mt-1 text-center text-sm text-gray-300">
            Join EduPath today
          </p>
        </div>
        <form className="mt-4 space-y-3" onSubmit={formik.handleSubmit} noValidate>
          <div className="space-y-3">
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
                className={`appearance-none relative block w-full px-3 py-2 border ${formik.errors.firstName ? 'border-red-500' : 'border-slate-600'} placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="John Doe"
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
                className={`appearance-none relative block w-full px-3 py-2 border ${formik.errors.lastName ? 'border-red-500' : 'border-slate-600'} placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Doe"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.lastName}
                </p>
              )}
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
                className={`appearance-none relative block w-full px-3 py-2 border ${formik.errors.email ? 'border-red-500' : 'border-slate-600'} placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="john@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.email}
                </p>
              )}
            </div>
            {/* <div className="grid grid-cols-2 gap-3"> */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`appearance-none relative block w-full px-3 py-2 border ${formik.errors.password ? 'border-red-500' : 'border-slate-600'} placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  placeholder="••••••••"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.password}
                  </p>
                )}
              </div>
              {/* <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div> */}
            {/* </div> */}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              {formik.isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center pt-1">
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-indigo-400 hover:text-indigo-300">
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
