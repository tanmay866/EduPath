import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LearnerShell, Card, CardHeader, CardFooterNote, Button, Field, Empty,
  InlineMessage, MicroLabel, OrdinalRow, type,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

/**
 * Spec §7 Resume & ATS — the ATS half.
 *
 * `1.5fr 1fr`, align-items start. Left: a score card split `200px 1fr`, the
 * left cell (border-right) a mono label, a mono 56px figure and a 13.5px
 * text-3 note; then the fix list — mono clay ordinals, title plus detail.
 * Right: the two inputs as a document card.
 *
 * Two spec details have no data behind them. /api/ats/analyze returns only
 * score, status, similarity, method and message — there is no per-dimension
 * breakdown, so the right cell of the score card carries the verdict and the
 * real metrics instead of four labelled bars. The fix list carries the four
 * standing recommendations the screen has always shown; they are advice, not
 * edits the app can perform, so there is no point value and no "Apply all".
 */
const RECOMMENDATIONS = [
  {
    title: 'Add keywords',
    detail: 'Include specific terms and phrases from the job description so the parser can match them.',
  },
  {
    title: 'Highlight skills',
    detail: 'Name the technical and soft skills the posting asks for, in the words it uses.',
  },
  {
    title: 'Show experience',
    detail: 'Quantify achievements and tie relevant work to the responsibilities listed.',
  },
  {
    title: 'Use industry terms',
    detail: 'Spell out standard terminology and acronyms the way the posting does.',
  },
];

const VALID_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const ATSAnalyzer = () => {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) navigate('/signin');
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (VALID_TYPES.includes(file.type)) {
      setResumeFile(file);
      setError('');
    } else {
      setError('Please upload a PDF, DOC, or DOCX file');
    }
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();

    if (!resumeFile || !jobDescription.trim()) {
      setError('Please upload a resume and enter job description');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResults(null);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Please login to use this feature');

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ats/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Analysis failed');

      setResults(data.data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
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
      if (!token) throw new Error('Please login to download reports');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ats/generate-report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisData: results }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'ATS-Analysis-Report.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Report download error:', err);
      setError(err.message || 'Failed to download report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const score = results ? Math.round(results.score || 0) : 0;
  const scoreTone = score >= 60 ? 'var(--color-green)' : score >= 40 ? 'var(--color-amber)' : 'var(--color-clay)';
  const strongMatch = score >= 80;

  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Build"
      title="ATS check"
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
        {/* Left column — the score, then the fix list. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Card>
            <CardHeader
              label="Match score"
              right={
                results && (
                  <Button variant="quiet" onClick={resetAnalysis}>Start over</Button>
                )
              }
            />

            {results ? (
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
                <div style={{ padding: '26px 22px', borderRight: '1px solid var(--color-line)' }}>
                  <MicroLabel
                    size={10.5}
                    tracking="0.13em"
                    color="var(--color-text-4)"
                    style={{ display: 'block', marginBottom: 10 }}
                  >
                    Score
                  </MicroLabel>
                  <span style={{ ...type.heroMetric, color: scoreTone, display: 'block', lineHeight: 1 }}>
                    {score}
                  </span>
                  <p style={{ fontSize: 13.5, color: 'var(--color-text-3)', margin: '10px 0 0', lineHeight: 1.5 }}>
                    {results.status || 'Analysed'}
                  </p>
                </div>

                <div style={{ padding: '26px 22px' }}>
                  <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>
                    {results.message}
                  </p>

                  <div style={{ marginTop: 18, borderTop: '1px solid var(--color-line-soft)' }}>
                    {[
                      { label: 'Similarity', value: results.similarity != null ? results.similarity : '—' },
                      { label: 'Method', value: results.method === 'sentence_transformers' ? 'Semantic' : 'Keyword overlap' },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '11px 0',
                          borderBottom: '1px solid var(--color-line-soft)',
                          fontSize: 14,
                          color: 'var(--color-text-2)',
                        }}
                      >
                        <span>{row.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-ink)' }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Empty>
                Upload a resume and paste the job description to see how closely they match.
              </Empty>
            )}

            {results && (
              <div style={{ padding: '18px 22px', borderTop: '1px solid var(--color-line)', display: 'flex', gap: 12 }}>
                <Button onClick={downloadReport} loading={generatingReport} loadingLabel="Generating…">
                  Download report
                </Button>
                <Button variant="secondary" onClick={resetAnalysis}>Analyse another</Button>
              </div>
            )}
          </Card>

          {results && (
            <Card>
              <CardHeader
                label={strongMatch ? 'Nothing outstanding' : `${RECOMMENDATIONS.length} ways to improve`}
              />

              {strongMatch ? (
                <Empty>
                  Your resume already aligns closely with this posting. Send it as it stands.
                </Empty>
              ) : (
                <>
                  {RECOMMENDATIONS.map((fix, i) => (
                    <div
                      key={fix.title}
                      style={{
                        padding: '16px 20px',
                        borderBottom: i === RECOMMENDATIONS.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
                      }}
                    >
                      <OrdinalRow ordinal={String(i + 1).padStart(2, '0')}>
                        <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--color-ink)' }}>
                          {fix.title}
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
                          {fix.detail}
                        </p>
                      </OrdinalRow>
                    </div>
                  ))}
                  <CardFooterNote>
                    These are edits to make in your own document — the analyser reads it, it does not rewrite it.
                  </CardFooterNote>
                </>
              )}
            </Card>
          )}
        </div>

        {/* Right column — the two inputs. */}
        <Card>
          <CardHeader label="Your documents" />

          <form onSubmit={handleAnalyze}>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <MicroLabel size={11} tracking="0.12em" style={{ display: 'block', marginBottom: 8 }}>
                  Resume
                </MicroLabel>

                <label
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    display: 'block',
                    padding: '24px 18px',
                    border: `1px solid ${dragActive ? 'var(--color-ink)' : 'var(--color-line-input)'}`,
                    background: dragActive ? 'var(--color-surface-active)' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'background-color 120ms ease, border-color 120ms ease',
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: 14.5, color: resumeFile ? 'var(--color-ink)' : 'var(--color-text-3)' }}>
                    {resumeFile ? resumeFile.name : 'Drop a PDF or DOCX here, or click to choose'}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11.5,
                      color: 'var(--color-text-4)',
                      marginTop: 7,
                    }}
                  >
                    {resumeFile ? `${(resumeFile.size / 1024).toFixed(0)} KB` : 'PDF · DOC · DOCX · UP TO 5MB'}
                  </span>
                </label>

                {resumeFile && (
                  <div style={{ marginTop: 10 }}>
                    <Button variant="quietClay" onClick={() => setResumeFile(null)}>Remove file</Button>
                  </div>
                )}
              </div>

              <Field label="Job description" help="Paste the whole posting — partial text scores lower than it should.">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={12}
                  placeholder="Paste the complete job description here"
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    fontSize: 15,
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.55,
                    color: 'var(--color-ink)',
                    background: '#fff',
                    border: '1px solid var(--color-line-input)',
                    borderRadius: 0,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </Field>

              {error && <InlineMessage tone="error">{error}</InlineMessage>}
            </div>

            <div style={{ padding: '18px 24px', borderTop: '1px solid var(--color-line)' }}>
              <Button
                type="submit"
                fullWidth
                loading={analyzing}
                loadingLabel="Analysing…"
                disabled={!resumeFile || !jobDescription.trim()}
              >
                Analyse resume
              </Button>
            </div>
          </form>

          <CardFooterNote>Your file is read for scoring and is not stored.</CardFooterNote>
        </Card>
      </div>
    </LearnerShell>
  );
};

export default ATSAnalyzer;
