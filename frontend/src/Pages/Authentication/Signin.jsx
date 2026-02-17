import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { useFormik } from 'formik';
import axios from 'axios';

const Signin = () => {
  const navigate = useNavigate();
  const formik  = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    onSubmit: async (values,{resetForm}) => {
      
      // Simulate API call
      try{
        const res = await axios.post('http://localhost:4000/api/auth/login', values);
        console.log(values);
        alert('Signin successful!');
        resetForm();
        navigate('/');
      } catch (error) {
        console.error('Signin error:', error);
        alert('Signin failed. Please try again.');
      }
    }
  });


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-10 rounded-2xl shadow-2xl border border-slate-700 relative">
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
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address / Login ID
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formik.values.email}
                onChange={formik.handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-slate-600 placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="john@example.com / MEPA2026002"
              />
            </div>
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
                className="appearance-none relative block w-full px-3 py-3 border border-slate-600 placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-600 bg-slate-700 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Sign In
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
