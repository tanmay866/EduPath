import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For name field, only allow letters and spaces
    if (name === 'name') {
      const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: alphabeticValue
      }));
    }
    // For phone field, only allow numbers
    else if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      setLoading(false);
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // Call backend API to send email
      const response = await fetch('http://localhost:4000/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || 'Message sent successfully! We\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(data.message || 'Failed to send message');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 relative">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="moving-shape shape-1"></div>
        <div className="moving-shape shape-2"></div>
        <div className="moving-shape shape-3"></div>
        <div className="moving-shape shape-4"></div>
        <div className="moving-shape shape-5"></div>
        <div className="moving-shape shape-6"></div>
        <div className="rotating-gradient"></div>
        
        <div className="floating-particle" style={{top: '5%', left: '15%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '8%', left: '85%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '15%', left: '50%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '25%', left: '70%', animationDelay: '1s'}}></div>
        <div className="floating-particle" style={{top: '45%', left: '10%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '65%', left: '80%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '75%', left: '30%', animationDelay: '0.5s'}}></div>
        <div className="floating-particle" style={{top: '85%', left: '60%', animationDelay: '2.5s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Contact <span className="text-blue-500">Us</span>
          </h1>
          <p className="text-gray-400 text-lg">
            We'd love to hear from you! Send us a message or visit our office.
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-6 backdrop-blur-lg bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl font-medium shadow-xl flex items-center gap-3 max-w-2xl mx-auto">
            <CheckCircle size={20} />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 backdrop-blur-lg bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl font-medium shadow-xl flex items-center gap-3 max-w-2xl mx-auto">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Contact Information */}
          <div className="space-y-4">
            {/* Our Address */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 backdrop-blur-lg bg-blue-500/30 border border-blue-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    Our Address
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    CHARUSAT University,<br />
                    Changa, Anand,<br />
                    Gujarat-388421.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Number */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 backdrop-blur-lg bg-blue-500/30 border border-blue-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    Contact No
                  </h3>
                  <a 
                    href="tel:+919512842105" 
                    className="text-gray-400 hover:text-blue-400 transition-colors text-base"
                  >
                    +91 9512842105
                  </a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 backdrop-blur-lg bg-blue-500/30 border border-blue-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    Email
                  </h3>
                  <a 
                    href="mailto:mihirpatel2102005@gmail.com" 
                    className="text-gray-400 hover:text-blue-400 transition-colors text-base"
                  >
                    mihirpatel2102005@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  pattern="[a-zA-Z\s]*"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all"
                  required
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your 10-digit phone number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength="10"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message..."
                  rows="5"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all resize-none"
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl hover:shadow-blue-500/50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
