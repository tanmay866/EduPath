import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { useFormik } from 'formik';
import axios from 'axios';
import { toast } from 'react-toastify';

const Signin = () => {
  const navigate = useNavigate();
  const formik  = useFormik({
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
    onSubmit: async (values,{resetForm}) => {
      
      // Simulate API call
      try{

        let payload = {
          password: values.password
        }

        // detect email or loginId
        if(values.identifier.includes('@')){
          payload.email = values.identifier;
        } else {
          payload.loginId = values.identifier;
        }

        console.log("Payload", payload);
        

        const res = await axios.post('http://localhost:4000/api/auth/login', payload);
        console.log(res);
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("email", res.data.user.email);
        sessionStorage.setItem("loginId", res.data.user.loginId);
        sessionStorage.setItem("role", res.data.user.role);
        sessionStorage.setItem("firstName", res.data.user.firstName);
        sessionStorage.setItem("lastName", res.data.user.lastName);
        toast.success('Signin successful!');
        resetForm();

        const userRole = res.data.user.role;
        if(userRole === 'admin'){          
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
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
                className={`appearance-none relative block w-full px-3 py-3 border ${formik.errors.identifier ? 'border-red-500' : 'border-slate-600'} placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
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
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`appearance-none relative block w-full px-3 py-3 border ${formik.errors.password ? 'border-red-500' : 'border-slate-600'} placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="••••••••"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.password}
                </p>
              )}
            </div>
          </div>

          {/* <div className="flex items-center justify-between">
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
          </div> */}

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
