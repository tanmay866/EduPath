import { useState } from 'react';

function ResumeBuilder() {
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
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
      const token = localStorage.getItem('token');
      
      // Always generate DOCX from backend first
      setMessage('Generating resume...');
      const response = await fetch('http://localhost:5000/api/resume/generate', {
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

      const docxUrl = `http://localhost:5000${data.data.downloadUrl}`;

      // If PDF is selected, convert Word to PDF
      if (format === 'pdf') {
        setMessage('Converting to PDF... This may take a moment.');
        
        const pdfUrl = await convertWordToPDF(docxUrl);
        
        // Download the PDF automatically
        setMessage('Downloading PDF...');
        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `resume_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        setMessage('Resume generated and downloaded successfully!');
        
      } else {
        // Download DOCX directly
        setMessage('Resume generated successfully!');
        window.open(docxUrl, '_blank');
      }
      
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Resume Builder</h1>
        <p className="text-gray-600">Create your professional resume</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.name}
                  onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="+1 234 567 890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                <input
                  type="url"
                  value={resumeData.personalInfo.github}
                  onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={resumeData.personalInfo.website}
                  onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Education</h3>
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800"
              >
                + Add Education
              </button>
            </div>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700">Education {index + 1}</h4>
                  {resumeData.education.length > 1 && (
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-600 text-sm hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="University Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="2018"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="2022"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CGPA/GPA</label>
                    <input
                      type="text"
                      value={edu.cgpa}
                      onChange={(e) => handleEducationChange(index, 'cgpa', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="3.8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Experience</h3>
              <button
                onClick={addExperience}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800"
              >
                + Add Experience
              </button>
            </div>
            {resumeData.experience.map((exp, expIndex) => (
              <div key={expIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700">Experience {expIndex + 1}</h4>
                  {resumeData.experience.length > 1 && (
                    <button
                      onClick={() => removeExperience(expIndex)}
                      className="text-red-600 text-sm hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(expIndex, 'position', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(expIndex, 'company', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleExperienceChange(expIndex, 'location', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(expIndex, 'startDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Jan 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(expIndex, 'endDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Present"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                  {exp.responsibilities.map((resp, respIndex) => (
                    <div key={respIndex} className="mb-2">
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => handleResponsibilityChange(expIndex, respIndex, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Describe your responsibility"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addResponsibility(expIndex)}
                    className="text-sm text-gray-600 hover:text-gray-800 mt-2"
                  >
                    + Add Responsibility
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Projects</h3>
              <button
                onClick={addProject}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800"
              >
                + Add Project
              </button>
            </div>
            {resumeData.projects.map((project, projIndex) => (
              <div key={projIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700">Project {projIndex + 1}</h4>
                  {resumeData.projects.length > 1 && (
                    <button
                      onClick={() => removeProject(projIndex)}
                      className="text-red-600 text-sm hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => handleProjectChange(projIndex, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Project Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => handleProjectChange(projIndex, 'description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows="3"
                      placeholder="Brief description of the project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                    {project.technologies.map((tech, techIndex) => (
                      <div key={techIndex} className="mb-2">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => handleTechnologyChange(projIndex, techIndex, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          placeholder="e.g., React, Node.js"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => addTechnology(projIndex)}
                      className="text-sm text-gray-600 hover:text-gray-800 mt-2"
                    >
                      + Add Technology
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
                    <input
                      type="url"
                      value={project.link}
                      onChange={(e) => handleProjectChange(projIndex, 'link', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Skills</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                {resumeData.skills.technical.map((skill, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange('technical', index, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="e.g., JavaScript, Python, React"
                    />
                  </div>
                ))}
                <button
                  onClick={() => addSkill('technical')}
                  className="text-sm text-gray-600 hover:text-gray-800 mt-2"
                >
                  + Add Technical Skill
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills</label>
                {resumeData.skills.soft.map((skill, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange('soft', index, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="e.g., Leadership, Communication"
                    />
                  </div>
                ))}
                <button
                  onClick={() => addSkill('soft')}
                  className="text-sm text-gray-600 hover:text-gray-800 mt-2"
                >
                  + Add Soft Skill
                </button>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Certifications</h3>
              <button
                onClick={addCertification}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800"
              >
                + Add Certification
              </button>
            </div>
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700">Certification {index + 1}</h4>
                  {resumeData.certifications.length > 1 && (
                    <button
                      onClick={() => removeCertification(index)}
                      className="text-red-600 text-sm hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="AWS Certified Solutions Architect"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Jan 2023"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Achievements</h3>
            {resumeData.achievements.map((achievement, index) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => handleAchievementChange(index, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Describe your achievement"
                />
              </div>
            ))}
            <button
              onClick={addAchievement}
              className="text-sm text-gray-600 hover:text-gray-800 mt-2"
            >
              + Add Achievement
            </button>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Generate Resume</h3>
            
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes('success')
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Download Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">Word (DOCX)</option>
                </select>
              </div>

              <button 
                onClick={handleGenerateResume}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-800 hover:to-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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

              <p className="text-xs text-gray-500 text-center mt-3">
                Fill in your information above and click to generate your professional resume
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
