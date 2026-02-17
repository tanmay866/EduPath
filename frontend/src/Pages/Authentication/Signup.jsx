import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { useFormik } from 'formik';
import axios from 'axios';

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
    onSubmit: async (values,{resetForm}) => {
      console.log(values);
      try {
        const response = await axios.post('http://localhost:4000/api/auth/signup', values);
        console.log("user created");
        
        console.log('Signup response:', response.data);
        alert('Signup successful! Please sign in.');
        resetForm();
        navigate('/signin');
      } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 relative">
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
        <form className="mt-4 space-y-3" onSubmit={formik.handleSubmit}>
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
                className="appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
              />
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
                className="appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Doe"
              />
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
                className="appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="john@example.com"
              />
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
                  className="appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
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
