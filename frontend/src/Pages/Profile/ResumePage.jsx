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
    <div className="min-h-screen bg-black pt-24 pb-12 px-8 relative overflow-hidden flex flex-col justify-center">
      {/* Resume page background — subtle grid + slow drifting orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div style={{
          position: 'absolute', top: '8%', left: '10%',
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)',
          animation: 'resumeOrb1 18s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%',
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)',
          animation: 'resumeOrb2 22s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', top: '45%', right: '20%',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.03), transparent 70%)',
          animation: 'resumeOrb1 26s ease-in-out infinite alternate-reverse',
        }} />
      </div>
      <style>{`
        @keyframes resumeOrb1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes resumeOrb2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-35px, -25px) scale(1.06); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Header */}
        <div data-animate className="mb-6 flex items-center gap-4" style={{ transitionDelay: '0s' }}>
          <button
            onClick={() => navigate('/profile')}
            className="p-2.5 backdrop-blur-lg bg-white/[0.03] hover:bg-white/[0.1] rounded-xl transition-all border border-white/5"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-black leading-none tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">Resume</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage documents & CVs</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-6 backdrop-blur-lg bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl font-medium shadow-xl flex items-center gap-3 text-sm">
            <CheckCircle size={18} />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 backdrop-blur-lg bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl font-medium shadow-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (Spans 5 Columns) - Uploaded Resumes */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="space-y-4">
              <div data-animate className="backdrop-blur-xl bg-[#0a0a0a]/80 rounded-[1.5rem] p-6 lg:p-8 border border-white/5 shadow-xl flex flex-col h-full min-h-[400px]" style={{ transitionDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <FolderOpen size={22} className="text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Uploaded <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 text-transparent bg-clip-text">Resumes</span>
                </h2>
                  <span className="ml-auto backdrop-blur-lg bg-white/10 px-3 py-1 rounded-full text-sm text-gray-300">
                    {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}
                  </span>
                </div>

                {/* Resume List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {resumes.length === 0 ? (
                    <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 backdrop-blur-lg bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-sm font-semibold mb-1">No resumes uploaded yet</p>
                      <p className="text-gray-500 text-xs">Upload your first resume using the form on the right</p>
                    </div>
                  ) : (
                    resumes.map((resume) => (
                      <div
                        key={resume._id}
                        className="backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 backdrop-blur-lg bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all">
                            <FileText size={20} className="text-emerald-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white mb-1 truncate transition-colors">
                              {resume.fileName}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 font-medium">
                              <span>{formatFileSize(resume.fileSize)}</span>
                              <span className="text-white/20">•</span>
                              <span>{new Date(resume.uploadDate).toLocaleDateString()}</span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDownload(resume)}
                                className="flex-1 py-2 backdrop-blur-lg bg-white/[0.03] hover:bg-white/[0.08] rounded-xl transition-all border border-white/5 text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                              >
                                <Download size={14} />
                                Download
                              </button>
                              <button
                                onClick={() => handleDelete(resume._id)}
                                className="px-3 py-2 backdrop-blur-lg bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20 text-red-400"
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
              <div className="rounded-[1.5rem] border border-white/5 overflow-hidden shadow-xl bg-[#0a0a0a]/50">
                <div className="backdrop-blur-xl p-5 border-b border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                    <AlertCircle size={16} className="text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    Why upload your resume?
                  </h4>
                </div>
                <div className="p-5">
                  <ul className="text-slate-400 text-xs space-y-3 font-medium">
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400/50 mt-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400/50 shrink-0"></span>
                      <span>Get personalized job and learning path recommendations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400/50 mt-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400/50 shrink-0"></span>
                      <span>AI-powered skill gap analysis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400/50 mt-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400/50 shrink-0"></span>
                      <span>Track your career progress over time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400/50 mt-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400/50 shrink-0"></span>
                      <span>Your data is stored securely and never shared</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Upload Section */}
          <div className="lg:col-span-7 backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6 lg:p-8 relative flex flex-col h-full sticky top-6">
            <div className="flex items-center gap-4 mb-6 shrink-0">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Upload size={22} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Upload New <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">Resume</span>
                </h2>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] uppercase tracking-wider font-bold text-cyan-400 mt-2 inline-block">
                  Document
                </span>
              </div>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center min-h-[350px] ${dragActive
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-[inset_0_0_50px_rgba(6,182,212,0.1)]'
                  : 'border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/[0.02] hover:bg-cyan-500/[0.05] shadow-[inset_0_0_20px_rgba(6,182,212,0.02)]'
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
                  <div className="mb-6 flex justify-center group cursor-pointer" onClick={() => document.getElementById('resume-file-input').click()}>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] group-hover:scale-110">
                      <Upload size={38} className="text-cyan-400" />
                    </div>
                  </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {dragActive ? <span className="text-cyan-400">Drop your resume here</span> : <>
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">Drag & Drop</span>
                  </>}
                </h3>

                <p className="text-gray-400 mb-6">
                  or click to browse your files
                </p>

                <button
                  onClick={() => document.getElementById('resume-file-input').click()}
                  disabled={loading}
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl transition-all shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mx-auto text-sm tracking-wide"
                >
                  <Upload size={18} />
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
            <div className="mt-8 p-5 backdrop-blur-lg bg-white/[0.02] border border-white/5 rounded-xl">
              <h4 className="text-white font-bold tracking-wide mb-3 text-xs uppercase">💡 Tips for best results:</h4>
              <ul className="text-slate-400 text-xs font-medium space-y-2">
                <li className="flex items-center gap-2"><span className="text-white/20">•</span><span>Use a well-formatted PDF for better parsing</span></li>
                <li className="flex items-center gap-2"><span className="text-white/20">•</span><span>Include clear sections for experience and skills</span></li>
                <li className="flex items-center gap-2"><span className="text-white/20">•</span><span>Keep file names descriptive (e.g., "John_Doe_Resume.pdf")</span></li>
                <li className="flex items-center gap-2"><span className="text-white/20">•</span><span>Update your resume regularly for accurate recommendations</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
