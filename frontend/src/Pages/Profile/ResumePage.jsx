import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Trash2, Download, CheckCircle, AlertCircle, FolderOpen } from 'lucide-react';
import { uploadResume, getResumes, deleteResume } from '../Services/resumeService';

const ResumePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Load existing resumes from backend
    loadResumes();
  }, [navigate]);

  // Scroll-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await getResumes();
      if (response.success) {
        setResumes(response.data);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

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

  const handleFile = async (file) => {
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

    setLoading(true);
    setUploadProgress(0);
    setError('');
    setMessage('');
    
    // Convert file to base64 for uploading
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const response = await uploadResume({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileData: reader.result
        }, (progress) => {
          setUploadProgress(progress);
        });

        if (response.success) {
          setMessage('Resume uploaded successfully!');
          setTimeout(() => setMessage(''), 3000);
          
          // Reload resumes from backend
          await loadResumes();
          
          // Reset file input
          const fileInput = document.getElementById('resume-file-input');
          if (fileInput) fileInput.value = '';
        }
      } catch (err) {
        setError(err.message || 'Failed to upload resume');
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
        setUploadProgress(0);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
      setTimeout(() => setError(''), 3000);
      setLoading(false);
      setUploadProgress(0);
    };
    
    reader.readAsDataURL(file);
  };

  const handleDelete = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      const response = await deleteResume(resumeId);
      if (response.success) {
        setMessage('Resume deleted successfully');
        setTimeout(() => setMessage(''), 3000);
        
        // Reload resumes from backend
        await loadResumes();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete resume');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDownload = (resume) => {
    // Open Cloudinary URL in new tab for download
    window.open(resume.cloudinaryUrl, '_blank');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 relative">
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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div data-animate className="mb-8 flex items-center gap-4" style={{transitionDelay: '0s'}}>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 backdrop-blur-lg bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-white/20"
          >
            <ArrowLeft size={24} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Resume Management</h1>
            <p className="text-gray-400">Upload and manage your resumes for better job recommendations</p>
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Uploaded Resumes List */}
          <div className="space-y-6">
            <div data-animate className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-6 border border-white/10 shadow-xl" style={{transitionDelay: '0.1s'}}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 backdrop-blur-lg bg-purple-500/30 border border-purple-400/30 rounded-lg flex items-center justify-center">
                  <FolderOpen size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Uploaded Resumes</h2>
                <span className="ml-auto backdrop-blur-lg bg-white/10 px-3 py-1 rounded-full text-sm text-gray-300">
                  {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}
                </span>
              </div>

              {/* Resume List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {resumes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 backdrop-blur-lg bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText size={40} className="text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-lg mb-2">No resumes uploaded yet</p>
                    <p className="text-gray-500 text-sm">Upload your first resume using the form on the right</p>
                  </div>
                ) : (
                  resumes.map((resume) => (
                    <div
                      key={resume._id}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 backdrop-blur-lg bg-emerald-500/30 border border-emerald-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={28} className="text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold mb-1 truncate group-hover:text-emerald-400 transition-colors">
                            {resume.fileName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <span>{formatFileSize(resume.fileSize)}</span>
                            <span>•</span>
                            <span>{new Date(resume.uploadDate).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(resume)}
                              className="flex-1 px-3 py-2 backdrop-blur-lg bg-blue-500/30 hover:bg-blue-500/40 rounded-lg transition-all border border-blue-400/50 text-white text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              Download
                            </button>
                            <button
                              onClick={() => handleDelete(resume._id)}
                              className="px-3 py-2 backdrop-blur-lg bg-red-500/30 hover:bg-red-500/40 rounded-lg transition-all border border-red-400/50 text-white"
                              title="Delete Resume"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="backdrop-blur-lg bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <AlertCircle size={18} />
                Why upload your resume?
              </h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Get personalized job and learning path recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>AI-powered skill gap analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Track your career progress over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Your data is stored securely and never shared</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Upload Section */}
          <div className="space-y-6">
            <div data-animate className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-6 border border-white/10 shadow-xl sticky top-6" style={{transitionDelay: '0.2s'}}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 backdrop-blur-lg bg-emerald-500/30 border border-emerald-400/30 rounded-lg flex items-center justify-center">
                  <Upload size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Upload New Resume</h2>
              </div>

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
                    {dragActive ? 'Drop your resume here' : 'Drag & Drop'}
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    or click to browse your files
                  </p>
                  
                  <button
                    onClick={() => document.getElementById('resume-file-input').click()}
                    disabled={loading}
                    className="px-8 py-3 backdrop-blur-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-white font-semibold rounded-xl transition-all border border-emerald-400/50 hover:border-emerald-400/70 hover:shadow-xl hover:shadow-emerald-500/50 disabled:bg-gray-600/30 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                  >
                    <Upload size={20} />
                    {loading ? `Uploading ${uploadProgress}%` : 'Choose File'}
                  </button>
                  
                  <p className="text-gray-500 text-sm mt-6">
                    Supported formats: PDF, DOC, DOCX
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Maximum file size: 5MB
                  </p>
                </div>
              </div>

              {/* Upload Tips */}
              <div className="mt-6 p-4 backdrop-blur-lg bg-purple-500/10 border border-purple-400/30 rounded-xl">
                <h4 className="text-white font-semibold mb-2 text-sm">💡 Tips for best results:</h4>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Use a well-formatted PDF for better parsing</li>
                  <li>• Include clear sections for experience and skills</li>
                  <li>• Keep file names descriptive (e.g., "John_Doe_Resume.pdf")</li>
                  <li>• Update your resume regularly for accurate recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
