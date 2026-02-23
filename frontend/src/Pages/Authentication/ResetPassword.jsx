import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { resetPassword } from '../Services/profileService';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!formData.password || !formData.confirmPassword) {
            toast.error('All fields are required');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await resetPassword(token, formData);

            if (response.success) {
                // Save token if available
                if (response.token) {
                    sessionStorage.setItem('token', response.token);
                }

                toast.success(response.message || 'Password reset successful!');

                // Redirect to signin after 2 seconds
                setTimeout(() => {
                    navigate('/signin');
                }, 2000);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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

            <div className="max-w-md w-full space-y-8 bg-slate-900/40 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10 relative z-10">
                <button
                    onClick={() => navigate('/signin')}
                    className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                >
                    <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Sign In</span>
                </button>

                <div className="text-center">
                    <div className="mx-auto w-16 h-16 backdrop-blur-lg bg-indigo-500/30 rounded-2xl flex items-center justify-center border border-indigo-400/30 mb-4">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h2 className="mt-4 text-center text-4xl font-extrabold text-white">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-300">
                        Enter your new password below
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* New Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter new password"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-400">
                            Remember your password?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/signin')}
                                className="font-medium text-indigo-400 hover:text-indigo-300"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
