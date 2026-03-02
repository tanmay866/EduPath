import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-black border-t border-slate-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-teal-600 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                Edu<span className="text-teal-400">Path</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted partner in career growth. Build skills, take assessments, and achieve your professional goals with AI-powered guidance.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/work" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">How It Works</Link></li>
              <li><Link to="/assessment" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">Assessment</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Account</h3>
            <ul className="space-y-3">
              <li><Link to="/signin" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">Sign In</Link></li>
              <li><Link to="/signup" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">Get Started</Link></li>
              <li><Link to="/profile" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">My Profile</Link></li>
              <li><Link to="/resume" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">Resume Builder</Link></li>
              <li><Link to="/settings" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">Settings</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2026 EduPath. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link to="/about" className="text-gray-400 hover:text-teal-400 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-400 hover:text-teal-400 transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
