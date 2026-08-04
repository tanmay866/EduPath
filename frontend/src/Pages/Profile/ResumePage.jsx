import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume, getResumes, deleteResume } from '../Services/resumeService';
import {
  LearnerShell, Card, CardHeader, CardFooterNote, Button, InlineMessage, MicroLabel,
  ProgressBar, TableHead, TableRow, NumCell, ActionCell, Empty,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

/**
 * Stored resume files, on the LearnerShell.
 *
 * §7 has no entry for this screen, so it follows the §5 table: a mono size
 * and date right-aligned, a right-aligned action pair, and the upload as a
 * card above with the progress bar the spec defines rather than a spinner.
 */

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
    <LearnerShell
      sections={learnerNav}
      eyebrow="Build"
      title="Stored resumes"
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      <div style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
        {message && <InlineMessage tone="success" style={{ marginBottom: 22 }}>{message}</InlineMessage>}
        {error && <InlineMessage tone="error" style={{ marginBottom: 22 }}>{error}</InlineMessage>}

        <Card>
          <CardHeader label="Upload" />
          <div style={{ padding: '22px 24px' }}>
            <label
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                display: 'block',
                padding: '34px 20px',
                border: `1px solid ${dragActive ? 'var(--color-ink)' : 'var(--color-line-input)'}`,
                background: dragActive ? 'var(--color-surface-active)' : '#fff',
                cursor: loading ? 'wait' : 'pointer',
                textAlign: 'center',
                transition: 'background-color 120ms ease, border-color 120ms ease',
              }}
            >
              <input
                type="file"
                id="resume-file-input"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
                disabled={loading}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: 15.5, color: 'var(--color-text-2)', display: 'block' }}>
                Drop a file here, or click to choose
              </span>
              <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-4)', marginTop: 8 }}>
                PDF · DOC · DOCX · UP TO 5MB
              </span>
            </label>

            {loading && (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <MicroLabel size={11} tracking="0.12em" color="var(--color-text-3)">Uploading</MicroLabel>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-text-3)' }}>
                    {`${uploadProgress}%`}
                  </span>
                </div>
                <ProgressBar value={uploadProgress} />
              </div>
            )}
          </div>

          <CardFooterNote>
            Files are stored so you can send them again later. Deleting one removes it for good.
          </CardFooterNote>
        </Card>

        <Card style={{ marginTop: 22 }}>
          <CardHeader
            label="Your files"
            right={
              <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
                {`${resumes.length} STORED`}
              </MicroLabel>
            }
          />

          {resumes.length === 0 ? (
            <Empty>Nothing uploaded yet. Anything you add here shows up in this list.</Empty>
          ) : (
            <>
              <TableHead columns="1.6fr 0.6fr 0.7fr 0.9fr" align={['left', 'right', 'right', 'right']}>
                <span>File</span>
                <span>Size</span>
                <span>Added</span>
                <span>Actions</span>
              </TableHead>

              {resumes.map((resume) => (
                <TableRow key={resume._id} columns="1.6fr 0.6fr 0.7fr 0.9fr">
                  <span style={{ color: 'var(--color-ink)', wordBreak: 'break-all' }}>{resume.fileName}</span>
                  <NumCell tone="var(--color-text-3)" size={12.5}>{formatFileSize(resume.fileSize)}</NumCell>
                  <NumCell tone="var(--color-text-4)" size={12.5}>
                    {new Date(resume.createdAt || resume.uploadedAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </NumCell>
                  <ActionCell>
                    <Button
                      variant="secondary"
                      style={{ padding: '7px 13px', fontSize: 13 }}
                      onClick={() => handleDownload(resume)}
                    >
                      Open
                    </Button>
                    <Button
                      variant="destructive"
                      style={{ padding: '7px 13px', fontSize: 13 }}
                      onClick={() => handleDelete(resume._id)}
                    >
                      Delete
                    </Button>
                  </ActionCell>
                </TableRow>
              ))}
            </>
          )}
        </Card>
      </div>
    </LearnerShell>
  );
};

export default ResumePage;
