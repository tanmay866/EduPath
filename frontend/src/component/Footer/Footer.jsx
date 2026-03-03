import React from 'react'
import { Link } from 'react-router-dom'
import EduPathLogo from '../EduPathLogo'

const Footer = () => {
  return (
    <footer className="bg-black border-t border-slate-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Brand Section */}
          <div className="space-y-4">
            <EduPathLogo size={40} showText={true} />
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted partner in career growth. Build skills, take assessments, and achieve your professional goals with AI-powered guidance.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://youtube.com/@edupathteam?si=pfAClrrvTT7361Od"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all duration-300 hover:scale-110"
                aria-label="EduPath YouTube Channel"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
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
