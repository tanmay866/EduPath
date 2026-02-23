import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Trash2, Download, CheckCircle, AlertCircle } from 'lucide-react';

const ResumePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const email = sessionStorage.getItem('email');
    if (!email) {
      navigate('/signin');
      return;
    }

    // Load existing resume from sessionStorage
    const savedResume = sessionStorage.getItem('resume');
    const savedResumeName = sessionStorage.getItem('resumeName');
    if (savedResume && savedResumeName) {
      setResumePreview({ data: savedResume, name: savedResumeName });
    }
  }, [navigate]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document (DOC, DOCX)');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setResumeFile(file);
    
    // Convert file to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setResumePreview({ data: reader.result, name: file.name, size: file.size, type: file.type });
      setMessage('');
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!resumeFile && !resumePreview) {
      setError('Please select a file to upload');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Store resume in sessionStorage (in production, you'd send this to a backend API)
      sessionStorage.setItem('resume', resumePreview.data);
      sessionStorage.setItem('resumeName', resumePreview.name);
      
      setMessage('Resume uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to upload resume');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setResumeFile(null);
    setResumePreview(null);
    sessionStorage.removeItem('resume');
    sessionStorage.removeItem('resumeName');
    setMessage('Resume removed successfully');
    setTimeout(() => setMessage(''), 3000);
    
    // Reset file input
    const fileInput = document.getElementById('resume-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleDownload = () => {
    if (resumePreview) {
      const link = document.createElement('a');
      link.href = resumePreview.data;
      link.download = resumePreview.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-32 pb-20 px-4 relative">
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

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 backdrop-blur-lg bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-white/20"
          >
            <ArrowLeft size={24} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Resume Upload</h1>
            <p className="text-gray-400">Upload your resume for better job recommendations</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-6 backdrop-blur-lg bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl font-medium shadow-xl flex items-center gap-3">
            <CheckCircle size={20} />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 backdrop-blur-lg bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl font-medium shadow-xl flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-white/10 shadow-xl">
          {!resumePreview ? (
            <>
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-white/20 hover:border-emerald-500/50 bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 backdrop-blur-lg bg-emerald-500/30 border border-emerald-400/30 rounded-full flex items-center justify-center">
                      <Upload size={40} className="text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {dragActive ? 'Drop your resume here' : 'Upload your resume'}
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    Drag and drop your resume or click to browse
                  </p>
                  
                  <button
                    onClick={() => document.getElementById('resume-file-input').click()}
                    className="px-6 py-3 backdrop-blur-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-white font-semibold rounded-xl transition-all border border-emerald-400/50 hover:border-emerald-400/70 hover:shadow-xl hover:shadow-emerald-500/50"
                  >
                    Choose File
                  </button>
                  
                  <p className="text-gray-500 text-sm mt-4">
                    Supported formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Resume Preview */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 backdrop-blur-lg bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 backdrop-blur-lg bg-emerald-500/30 border border-emerald-400/30 rounded-xl flex items-center justify-center">
                      <FileText size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{resumePreview.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {resumePreview.size ? formatFileSize(resumePreview.size) : 'Size unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownload}
                      className="p-3 backdrop-blur-lg bg-blue-500/30 hover:bg-blue-500/40 rounded-lg transition-all border border-blue-400/50 text-white"
                      title="Download Resume"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-3 backdrop-blur-lg bg-red-500/30 hover:bg-red-500/40 rounded-lg transition-all border border-red-400/50 text-white"
                      title="Delete Resume"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Upload Button */}
                {resumeFile && !sessionStorage.getItem('resume') && (
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full px-6 py-4 backdrop-blur-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-white font-semibold rounded-xl transition-all disabled:bg-gray-600/30 disabled:cursor-not-allowed border border-emerald-400/50 hover:border-emerald-400/70 hover:shadow-xl hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    {loading ? 'Uploading...' : 'Save Resume'}
                  </button>
                )}

                {/* Upload Another Button */}
                <button
                  onClick={() => {
                    setResumeFile(null);
                    setResumePreview(null);
                    const fileInput = document.getElementById('resume-file-input');
                    if (fileInput) fileInput.value = '';
                  }}
                  className="w-full px-6 py-3 backdrop-blur-lg bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all border border-white/10 hover:border-white/20"
                >
                  Upload Different Resume
                </button>
              </div>
            </>
          )}

          {/* Info Section */}
          <div className="mt-8 p-6 backdrop-blur-lg bg-blue-500/10 border border-blue-400/30 rounded-xl">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Why upload your resume?
            </h4>
            <ul className="text-gray-400 text-sm space-y-2 ml-6">
              <li className="list-disc">Get personalized job and learning path recommendations</li>
              <li className="list-disc">AI-powered skill gap analysis</li>
              <li className="list-disc">Track your career progress</li>
              <li className="list-disc">Your data is stored securely and never shared</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
