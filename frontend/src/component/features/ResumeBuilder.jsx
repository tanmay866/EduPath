import { useState } from 'react';

function ResumeBuilder() {
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedResumeUrl, setGeneratedResumeUrl] = useState('');

  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: ''
    },
    education: [
      {
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        cgpa: ''
      }
    ],
    experience: [
      {
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        responsibilities: ['']
      }
    ],
    projects: [
      {
        title: '',
        description: '',
        technologies: [''],
        link: ''
      }
    ],
    skills: {
      technical: [''],
      soft: ['']
    },
    certifications: [
      {
        name: '',
        issuer: '',
        date: ''
      }
    ],
    achievements: ['']
  });

  const handlePersonalInfoChange = (field, value) => {
    setResumeData({
      ...resumeData,
      personalInfo: { ...resumeData.personalInfo, [field]: value }
    });
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...resumeData.education];
    newEducation[index][field] = value;
    setResumeData({ ...resumeData, education: newEducation });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { degree: '', institution: '', startDate: '', endDate: '', cgpa: '' }]
    });
  };

  const removeEducation = (index) => {
    const newEducation = resumeData.education.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, education: newEducation });
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...resumeData.experience];
    newExperience[index][field] = value;
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const handleResponsibilityChange = (expIndex, respIndex, value) => {
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].responsibilities[respIndex] = value;
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const addResponsibility = (expIndex) => {
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].responsibilities.push('');
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { company: '', position: '', location: '', startDate: '', endDate: '', responsibilities: [''] }]
    });
  };

  const removeExperience = (index) => {
    const newExperience = resumeData.experience.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...resumeData.projects];
    newProjects[index][field] = value;
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const handleTechnologyChange = (projIndex, techIndex, value) => {
    const newProjects = [...resumeData.projects];
    newProjects[projIndex].technologies[techIndex] = value;
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const addTechnology = (projIndex) => {
    const newProjects = [...resumeData.projects];
    newProjects[projIndex].technologies.push('');
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, { title: '', description: '', technologies: [''], link: '' }]
    });
  };

  const removeProject = (index) => {
    const newProjects = resumeData.projects.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const handleSkillChange = (type, index, value) => {
    const newSkills = { ...resumeData.skills };
    newSkills[type][index] = value;
    setResumeData({ ...resumeData, skills: newSkills });
  };

  const addSkill = (type) => {
    const newSkills = { ...resumeData.skills };
    newSkills[type].push('');
    setResumeData({ ...resumeData, skills: newSkills });
  };

  const handleCertificationChange = (index, field, value) => {
    const newCertifications = [...resumeData.certifications];
    newCertifications[index][field] = value;
    setResumeData({ ...resumeData, certifications: newCertifications });
  };

  const addCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [...resumeData.certifications, { name: '', issuer: '', date: '' }]
    });
  };

  const removeCertification = (index) => {
    const newCertifications = resumeData.certifications.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, certifications: newCertifications });
  };

  const handleAchievementChange = (index, value) => {
    const newAchievements = [...resumeData.achievements];
    newAchievements[index] = value;
    setResumeData({ ...resumeData, achievements: newAchievements });
  };

  const addAchievement = () => {
    setResumeData({
      ...resumeData,
      achievements: [...resumeData.achievements, '']
    });
  };

  const convertWordToPDF = async (docxUrl) => {
    const FREECONVERT_API_KEY = 'api_production_466ce2af843ae6fd3f26b420cf5b772f2b71055ac7805f46be45f277835e701b.697b1099142a194b36479c9e.697b10cca22aa85dd562b2ce';
    
    try {
      // Step 1: Download the DOCX file from our server
      console.log('Downloading DOCX file from:', docxUrl);
      const fileResponse = await fetch(docxUrl);
      const fileBlob = await fileResponse.blob();
      console.log('File downloaded, size:', fileBlob.size, 'bytes');
      
      // Step 2: Create a job with all tasks
      console.log('Creating conversion job...');
      const jobResponse = await fetch('https://api.freeconvert.com/v1/process/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FREECONVERT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tasks: {
            'upload-my-file': {
              operation: 'import/upload'
            },
            'convert-to-pdf': {
              operation: 'convert',
              input: 'upload-my-file',
              output_format: 'pdf'
            },
            'export-pdf': {
              operation: 'export/url',
              input: 'convert-to-pdf'
            }
          }
        })
      });

      if (!jobResponse.ok) {
        const errorData = await jobResponse.json();
        console.error('Job creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to create conversion job');
      }

      const jobData = await jobResponse.json();
      console.log('Job created:', jobData);

      // Step 3: Find the upload task ID
      let uploadTaskId = null;
      
      // Check if tasks is an array or object
      if (Array.isArray(jobData.tasks)) {
        const uploadTask = jobData.tasks.find(t => t.name === 'upload-my-file' || t.operation === 'import/upload');
        uploadTaskId = uploadTask?.id;
      } else if (typeof jobData.tasks === 'object') {
        const uploadTask = Object.values(jobData.tasks).find(t => t.name === 'upload-my-file' || t.operation === 'import/upload');
        uploadTaskId = uploadTask?.id;
      }

      if (!uploadTaskId) {
        console.error('Upload task not found in job data:', jobData);
        throw new Error('Upload task not found in job response');
      }

      console.log('Upload task ID:', uploadTaskId);

      // Step 4: Get the full upload task details to find the correct upload URL
      console.log('Getting upload task details...');
      const taskDetailsResponse = await fetch(`https://api.freeconvert.com/v1/process/tasks/${uploadTaskId}`, {
        headers: {
          'Authorization': `Bearer ${FREECONVERT_API_KEY}`
        }
      });

      if (!taskDetailsResponse.ok) {
        console.error('Failed to get task details');
        throw new Error('Failed to get upload task details');
      }

      const taskDetails = await taskDetailsResponse.json();
      console.log('Upload task details:', taskDetails);

      // Check if task has a form with parameters
      if (!taskDetails.result || !taskDetails.result.form) {
        throw new Error('Upload form not found in task details');
      }

      const uploadForm = taskDetails.result.form;
      console.log('Upload form:', uploadForm);

      // Step 5: Upload the file using the form parameters
      console.log('Uploading file...');
      const formData = new FormData();
      
      // Add all form parameters from the task details
      if (uploadForm.parameters) {
        Object.entries(uploadForm.parameters).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      
      // Add the file last
      formData.append('file', fileBlob, 'resume.docx');

      const uploadResponse = await fetch(uploadForm.url, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed. Status:', uploadResponse.status, 'Response:', errorText);
        throw new Error('Failed to upload file');
      }

      console.log('File uploaded successfully');

      // Step 5: Poll for job completion
      console.log('Waiting for conversion to complete...');
      let attempts = 0;
      const maxAttempts = 60; // 3 minutes timeout
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        const statusResponse = await fetch(`https://api.freeconvert.com/v1/process/jobs/${jobData.id}`, {
          headers: {
            'Authorization': `Bearer ${FREECONVERT_API_KEY}`
          }
        });

        if (!statusResponse.ok) {
          console.error('Failed to get job status');
          attempts++;
          continue;
        }

        const statusData = await statusResponse.json();
        console.log('Job status:', statusData.status, 'Attempt:', attempts + 1);
        
        if (statusData.status === 'completed') {
          // Find the export task
          let exportTask = null;
          if (Array.isArray(statusData.tasks)) {
            exportTask = statusData.tasks.find(t => t.name === 'export-pdf' || t.operation === 'export/url');
          } else if (typeof statusData.tasks === 'object') {
            exportTask = Object.values(statusData.tasks).find(t => t.name === 'export-pdf' || t.operation === 'export/url');
          }

          if (exportTask && exportTask.result && exportTask.result.url) {
            console.log('Conversion successful! PDF URL:', exportTask.result.url);
            return exportTask.result.url;
          }
          throw new Error('PDF URL not found in export task result');
        } else if (statusData.status === 'error' || statusData.status === 'failed') {
          console.error('Conversion failed:', statusData);
          throw new Error('Conversion failed: ' + (statusData.message || statusData.status));
        }
        
        attempts++;
      }
      
      throw new Error('Conversion timeout - please try again');
    } catch (error) {
      console.error('Conversion error:', error);
      throw new Error(`PDF conversion failed: ${error.message}`);
    }
  };

  const handleGenerateResume = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = sessionStorage.getItem('token');

      // Always generate DOCX from backend first
      setMessage('Generating resume...');
      const response = await fetch('http://localhost:4000/api/resume-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate resume');
      }

      const docxUrl = `http://localhost:4000${data.data.downloadUrl}`;
      setGeneratedResumeUrl(docxUrl);

      setShowPreview(true);
      setMessage('Resume generated successfully! Review your information and download when ready.');

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedResumeUrl) return;

    try {
      setLoading(true);
      setMessage('Preparing download...');

      if (format === 'pdf') {
        setMessage('Converting to PDF... This may take a moment.');
        const pdfUrl = await convertWordToPDF(generatedResumeUrl);

        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();

        const downloadUrl = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `resume_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        setMessage('PDF downloaded successfully!');
      } else {
        window.open(generatedResumeUrl, '_blank');
        setMessage('DOCX downloaded successfully!');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResume = () => {
    setShowPreview(false);
    setGeneratedResumeUrl('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-black pt-36 pb-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => showPreview ? handleEditResume() : window.history.back()}
            className="mt-1 p-3 backdrop-blur-lg bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">
              {showPreview ? 'Resume Preview' : 'Resume Builder'}
            </h1>
            <p className="text-gray-400 text-lg">
              {showPreview ? 'Review your resume before downloading' : 'Create your professional resume with ease'}
            </p>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-xl border ${message.includes('success') || message.includes('Success') ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/20 border-amber-500/30 text-amber-300'}`}>
            {message}
          </div>
        )}

        {/* Preview Section */}
        {showPreview ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Resume Info Card */}
              <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Resume Ready!</h3>
                    <p className="text-gray-400 text-sm">Successfully generated</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Format Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Download Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="pdf">PDF Format</option>
                      <option value="docx">DOCX Format</option>
                    </select>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download {format.toUpperCase()}
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={handleEditResume}
                    className="w-full px-6 py-3.5 backdrop-blur-lg bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 hover:border-white/20 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Resume
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h4 className="text-sm font-semibold text-white">Preview Tips</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>Review all sections carefully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>Check for typos and formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>Download when satisfied</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Panel - Resume Summary */}
            <div className="lg:col-span-3">
              <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">Resume Summary</h3>
                </div>

                {/* Resume Content Summary */}
                <div className="bg-slate-800/50 rounded-xl p-6 max-h-[calc(100vh-280px)] overflow-y-auto space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h4>
                    <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 text-sm">
                      <p className="text-white font-medium text-lg">{resumeData.personalInfo.name || 'Not provided'}</p>
                      {resumeData.personalInfo.email && <p className="text-gray-300">{resumeData.personalInfo.email}</p>}
                      {resumeData.personalInfo.phone && <p className="text-gray-300">{resumeData.personalInfo.phone}</p>}
                      {resumeData.personalInfo.location && <p className="text-gray-300">{resumeData.personalInfo.location}</p>}
                      <div className="flex flex-wrap gap-3 text-cyan-400 pt-2">
                        {resumeData.personalInfo.linkedin && <span>LinkedIn</span>}
                        {resumeData.personalInfo.github && <span>GitHub</span>}
                        {resumeData.personalInfo.website && <span>Website</span>}
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  {resumeData.education.some(edu => edu.degree || edu.institution) && (
                    <div>
                      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        Education ({resumeData.education.filter(e => e.degree || e.institution).length})
                      </h4>
                      <div className="space-y-3">
                        {resumeData.education.map((edu, index) => (
                          (edu.degree || edu.institution) && (
                            <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                              <p className="text-white font-medium">{edu.degree || 'Degree not specified'}</p>
                              <p className="text-gray-300 text-sm">{edu.institution}</p>
                              {(edu.startDate || edu.endDate) && (
                                <p className="text-gray-400 text-xs mt-1">{edu.startDate} - {edu.endDate}</p>
                              )}
                              {edu.cgpa && <p className="text-cyan-400 text-xs mt-1">CGPA: {edu.cgpa}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.some(exp => exp.company || exp.position) && (
                    <div>
                      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Work Experience ({resumeData.experience.filter(e => e.company || e.position).length})
                      </h4>
                      <div className="space-y-3">
                        {resumeData.experience.map((exp, index) => (
                          (exp.company || exp.position) && (
                            <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                              <p className="text-white font-medium">{exp.position || 'Position not specified'}</p>
                              <p className="text-gray-300 text-sm">{exp.company}{exp.location && `, ${exp.location}`}</p>
                              {(exp.startDate || exp.endDate) && (
                                <p className="text-gray-400 text-xs mt-1">{exp.startDate} - {exp.endDate}</p>
                              )}
                              {exp.responsibilities.filter(r => r).length > 0 && (
                                <p className="text-gray-400 text-xs mt-2">{exp.responsibilities.filter(r => r).length} responsibilities listed</p>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.some(proj => proj.title) && (
                    <div>
                      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Projects ({resumeData.projects.filter(p => p.title).length})
                      </h4>
                      <div className="space-y-3">
                        {resumeData.projects.map((proj, index) => (
                          proj.title && (
                            <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                              <p className="text-white font-medium">{proj.title}</p>
                              {proj.description && <p className="text-gray-300 text-sm mt-1">{proj.description}</p>}
                              {proj.technologies.filter(t => t).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {proj.technologies.filter(t => t).slice(0, 5).map((tech, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {(resumeData.skills.technical.some(s => s) || resumeData.skills.soft.some(s => s)) && (
                    <div>
                      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Skills
                      </h4>
                      <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                        {resumeData.skills.technical.filter(s => s).length > 0 && (
                          <div>
                            <p className="text-white text-sm font-medium mb-2">Technical Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {resumeData.skills.technical.filter(s => s).map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {resumeData.skills.soft.filter(s => s).length > 0 && (
                          <div>
                            <p className="text-white text-sm font-medium mb-2">Soft Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {resumeData.skills.soft.filter(s => s).map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {resumeData.certifications.some(cert => cert.name) && (
                    <div>
                      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Certifications ({resumeData.certifications.filter(c => c.name).length})
                      </h4>
                      <div className="space-y-2">
                        {resumeData.certifications.map((cert, index) => (
                          cert.name && (
                            <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                              <p className="text-white text-sm font-medium">{cert.name}</p>
                              {cert.issuer && <p className="text-gray-300 text-xs">{cert.issuer}</p>}
                              {cert.date && <p className="text-gray-400 text-xs">{cert.date}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {resumeData.achievements.some(a => a) && (
                    <div>
                      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Achievements ({resumeData.achievements.filter(a => a).length})
                      </h4>
                      <div className="space-y-2">
                        {resumeData.achievements.filter(a => a).map((achievement, index) => (
                          <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                            <p className="text-gray-300 text-sm">{achievement}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Form Section */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Panel */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Information */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.name}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.website}
                    onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Education</h3>
                <button
                  onClick={addEducation}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white rounded-xl font-medium border border-indigo-500/40 hover:from-indigo-500/90 hover:to-purple-500/90 hover:scale-105 transition-all duration-200"
                >
                  + Add Education
                </button>
              </div>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="mb-6 p-4 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white">Education {index + 1}</h4>
                    {resumeData.education.length > 1 && (
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Degree *</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="Bachelor of Science in Computer Science"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Institution *</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="2018"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="2022"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">CGPA/GPA</label>
                      <input
                        type="text"
                        value={edu.cgpa}
                        onChange={(e) => handleEducationChange(index, 'cgpa', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="3.8"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Experience</h3>
                <button
                  onClick={addExperience}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white rounded-xl font-medium border border-indigo-500/40 hover:from-indigo-500/90 hover:to-purple-500/90 hover:scale-105 transition-all duration-200"
                >
                  + Add Experience
                </button>
              </div>
              {resumeData.experience.map((exp, expIndex) => (
                <div key={expIndex} className="mb-6 p-4 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white">Experience {expIndex + 1}</h4>
                    {resumeData.experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(expIndex)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Position *</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => handleExperienceChange(expIndex, 'position', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Company *</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(expIndex, 'company', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleExperienceChange(expIndex, 'location', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleExperienceChange(expIndex, 'startDate', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="Jan 2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => handleExperienceChange(expIndex, 'endDate', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="Present"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Responsibilities</label>
                    {exp.responsibilities.map((resp, respIndex) => (
                      <div key={respIndex} className="mb-2">
                        <input
                          type="text"
                          value={resp}
                          onChange={(e) => handleResponsibilityChange(expIndex, respIndex, e.target.value)}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                          placeholder="Describe your responsibility"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => addResponsibility(expIndex)}
                      className="text-sm text-cyan-400 hover:text-cyan-300 font-medium mt-2 transition-colors"
                    >
                      + Add Responsibility
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Projects</h3>
                <button
                  onClick={addProject}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white rounded-xl font-medium border border-indigo-500/40 hover:from-indigo-500/90 hover:to-purple-500/90 hover:scale-105 transition-all duration-200"
                >
                  + Add Project
                </button>
              </div>
              {resumeData.projects.map((project, projIndex) => (
                <div key={projIndex} className="mb-6 p-4 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white">Project {projIndex + 1}</h4>
                    {resumeData.projects.length > 1 && (
                      <button
                        onClick={() => removeProject(projIndex)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Project Title *</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleProjectChange(projIndex, 'title', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="Project Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => handleProjectChange(projIndex, 'description', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200 resize-y"
                        rows="3"
                        placeholder="Brief description of the project"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Technologies</label>
                      {project.technologies.map((tech, techIndex) => (
                        <div key={techIndex} className="mb-2">
                          <input
                            type="text"
                            value={tech}
                            onChange={(e) => handleTechnologyChange(projIndex, techIndex, e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                            placeholder="e.g., React, Node.js"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => addTechnology(projIndex)}
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-medium mt-2 transition-colors"
                      >
                        + Add Technology
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Project Link</label>
                      <input
                        type="url"
                        value={project.link}
                        onChange={(e) => handleProjectChange(projIndex, 'link', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">Skills</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Technical Skills</label>
                  {resumeData.skills.technical.map((skill, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleSkillChange('technical', index, e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="e.g., JavaScript, Python, React"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addSkill('technical')}
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium mt-2 transition-colors"
                  >
                    + Add Technical Skill
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Soft Skills</label>
                  {resumeData.skills.soft.map((skill, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleSkillChange('soft', index, e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="e.g., Leadership, Communication"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addSkill('soft')}
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium mt-2 transition-colors"
                  >
                    + Add Soft Skill
                  </button>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Certifications</h3>
                <button
                  onClick={addCertification}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white rounded-xl font-medium border border-indigo-500/40 hover:from-indigo-500/90 hover:to-purple-500/90 hover:scale-105 transition-all duration-200"
                >
                  + Add Certification
                </button>
              </div>
              {resumeData.certifications.map((cert, index) => (
                <div key={index} className="mb-6 p-4 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white">Certification {index + 1}</h4>
                    {resumeData.certifications.length > 1 && (
                      <button
                        onClick={() => removeCertification(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Certification Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="AWS Certified Solutions Architect"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Issuer</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="Amazon Web Services"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                      <input
                        type="text"
                        value={cert.date}
                        onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                        placeholder="Jan 2023"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">Achievements</h3>
              {resumeData.achievements.map((achievement, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => handleAchievementChange(index, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:border-white/20 transition-all duration-200"
                    placeholder="Describe your achievement"
                  />
                </div>
              ))}
              <button
                onClick={addAchievement}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium mt-2 transition-colors"
              >
                + Add Achievement
              </button>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6 sticky top-28 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">Generate Resume</h3>

              {message && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                  message.includes('success')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Download Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFormat('pdf')}
                      className={`px-4 py-3 rounded-xl font-medium border transition-all duration-200 ${
                        format === 'pdf'
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => setFormat('docx')}
                      className={`px-4 py-3 rounded-xl font-medium border transition-all duration-200 ${
                        format === 'docx'
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      DOCX
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateResume}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Generate Resume'
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Fill in your information and click to generate your professional resume
                </p>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default ResumeBuilder;
