import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ATSAnalyzer() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (validTypes.includes(file.type)) {
        setResumeFile(file);
        setError('');
      } else {
        setError('Please upload a PDF, DOC, or DOCX file');
      }
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!resumeFile || !jobDescription.trim()) {
      setError('Please upload a resume and enter job description');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResults(null);

    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        throw new Error('Please login to use this feature');
      }

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('http://localhost:4000/api/ats/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed');
      }

      setResults(data.data);

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResults(null);
    setResumeFile(null);
    setJobDescription('');
    setError('');
  };

  const downloadReport = async () => {
    if (!results) {
      setError('No analysis results available to generate report');
      return;
    }

    setGeneratingReport(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        throw new Error('Please login to download reports');
      }

      const response = await fetch('http://localhost:4000/api/ats/generate-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysisData: results
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'ATS-Analysis-Report.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

    } catch (error) {
      console.error('Report download error:', error);
      setError(error.message || 'Failed to download report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-8 relative overflow-hidden flex flex-col justify-center">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div style={{
          position: 'absolute', top: '8%', left: '10%',
          width: 420, height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)',
          animation: 'settingOrb1 18s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%',
          width: 360, height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)',
          animation: 'settingOrb2 22s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', top: '45%', right: '20%',
          width: 260, height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.03), transparent 70%)',
          animation: 'settingOrb1 26s ease-in-out infinite alternate-reverse',
        }} />
      </div>
      <style>{`
        @keyframes settingOrb1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes settingOrb2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-35px, -25px) scale(1.06); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full relative z-10 space-y-8 mt-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2.5 backdrop-blur-lg bg-white/[0.03] hover:bg-white/[0.1] rounded-xl transition-all border border-white/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-white leading-none tracking-tight">ATS Analyzer</h1>
            <p className="text-slate-400 text-sm mt-1">Analyze your resume against job descriptions for better matches</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="backdrop-blur-xl bg-red-900/40 border border-red-500/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        {!results && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Job Description */}
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Job Description</h2>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                placeholder="Paste the complete job description here...

Include:
• Job title and role
• Required qualifications
• Key responsibilities
• Required skills and technologies
• Preferred experience"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors resize-none text-sm"
              />
              <p className="text-gray-500 text-sm mt-3">
                Tip: Include the full job description for more accurate analysis
              </p>
            </div>

            {/* Right Column - Resume Upload */}
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Upload Resume</h2>
              </div>

              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : resumeFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-white/10 bg-[#0a0a0a]/50 hover:border-emerald-500/50 hover:bg-[#0a0a0a]'
                }`}
              >
                {resumeFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                      <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white text-lg">{resumeFile.name}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setResumeFile(null)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                      <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">Drag & Drop</p>
                      <p className="text-gray-400 text-sm">or click to browse your files</p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-500 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Choose File
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <p className="text-gray-500 text-sm">Supported formats: PDF, DOC, DOCX</p>
                <p className="text-gray-500 text-sm">Maximum file size: 5MB</p>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !resumeFile || !jobDescription.trim()}
                className="w-full mt-6 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-500 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Resume...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Analyze Resume
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Why Use ATS Analyzer - Info Box */}
        {!results && (
          <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Why use ATS Analyzer?</h3>
            </div>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Get AI-powered semantic similarity analysis between your resume and job requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Identify missing keywords and skills that could improve your application</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Increase your chances of passing through Applicant Tracking Systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Get personalized recommendations to optimize your resume</span>
              </li>
            </ul>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* Main Score Card */}
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete</h2>
                <p className="text-gray-400">Your resume has been analyzed against the job requirements</p>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Score Circle */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                      {/* Background circle */}
                      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                      {/* Progress circle */}
                      <circle
                        cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${
                          results.score >= 80 ? 'text-emerald-400' :
                          results.score >= 60 ? 'text-cyan-400' :
                          results.score >= 40 ? 'text-amber-400' : 'text-red-400'
                        }`}
                        strokeDasharray={`${(results.score || 0) * 5.03} 503`}
                        strokeDashoffset="0"
                      />
                    </svg>
                    {/* Score text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-6xl font-bold ${
                          results.score >= 80 ? 'text-emerald-400' :
                          results.score >= 60 ? 'text-cyan-400' :
                          results.score >= 40 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {results.score ? Math.round(results.score) : 0}%
                        </div>
                        <div className="text-gray-400 text-lg font-medium">ATS Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Details */}
                <div className="flex-1 space-y-6">
                  {/* Status */}
                  <div className="text-center lg:text-left">
                    <div className={`inline-block px-6 py-3 rounded-full text-lg font-bold mb-4 ${
                      results.score >= 80 ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40' :
                      results.score >= 60 ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/40' :
                      results.score >= 40 ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/40' :
                      'bg-red-500/20 text-red-300 border-2 border-red-500/40'
                    }`}>
                      {results.status || 'No Status'}
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
                      {results.message}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl shadow-lg p-4">
                      <div className="text-2xl font-bold text-white">{results.similarity || 0}</div>
                      <div className="text-sm text-gray-400">Similarity Score</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl shadow-lg p-4">
                      <div className={`text-2xl font-bold ${
                        results.score >= 80 ? 'text-emerald-400' :
                        results.score >= 60 ? 'text-cyan-400' :
                        results.score >= 40 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {results.score >= 80 ? 'Excellent' :
                         results.score >= 60 ? 'Good' :
                         results.score >= 40 ? 'Fair' : 'Needs Work'}
                      </div>
                      <div className="text-sm text-gray-400">Match Level</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Recommendations</h3>
                  <p className="text-gray-400">Ways to improve your resume score</p>
                </div>
              </div>

              {results.score >= 80 ? (
                <div className="bg-[#0a0a0a] border border-emerald-500/20 rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-full">
                      <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-emerald-400 mb-2">Outstanding Match!</h4>
                      <p className="text-emerald-200 text-lg">Your resume aligns excellently with the job requirements. You're well-prepared to submit your application!</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">Add Keywords</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">Include more specific terms and phrases from the job description to improve ATS compatibility.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">Highlight Skills</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">Emphasize relevant technical and soft skills that match the job requirements.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">Show Experience</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">Quantify achievements and highlight relevant work experience with specific results.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-orange-500/20 rounded-lg flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">Use Industry Terms</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">Incorporate industry-standard terminology and acronyms from the job posting.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetAnalysis}
                className="flex-1 px-6 py-4 bg-[#0a0a0a] hover:bg-white/[0.02] text-white rounded-xl border border-white/10 hover:border-white/20 font-bold text-sm transition-all duration-500 flex items-center justify-center gap-3 text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Analyze Another Resume
              </button>
              <button
                onClick={downloadReport}
                disabled={generatingReport}
                className="flex-1 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-500 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingReport ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Report
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ATSAnalyzer;
