import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LearnerShell, Card, CardHeader, CardFooterNote, Button, Field, Empty,
  InlineMessage, MicroLabel, LabelledBar, OrdinalRow, type,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

/**
 * Spec §7 Resume & ATS — the ATS half.
 *
 * `1.5fr 1fr`, align-items start. Left: a score card split `200px 1fr` — a
 * mono label, a mono 56px figure and a 13.5px text-3 note in the left cell,
 * four labelled bars in the right. Then the fix list: a header strip counting
 * what remains beside a quiet clay "Mark all done", rows of mono clay ordinal
 * plus title and detail, and a right button showing the point value in clay
 * outline that turns green outline DONE.
 *
 * The scorer measures each of the four dimensions and names the terms that are
 * actually missing, so both come from the response rather than being invented
 * here. The buttons mark a fix as handled by you — EduPath reads your document,
 * it does not edit it — which is what the footer note says.
 */

/** Bars read green at 70 and above, clay below 40, navy in between. */
const barTone = (value) => (value >= 70 ? 'green' : value < 40 ? 'clay' : 'navy');

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
  // Which fixes the user has ticked off. Reset with every new analysis.
  const [applied, setApplied] = useState([]);

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
    setApplied([]);

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
    setApplied([]);
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

  // A dimension the scorer could not measure is left out rather than drawn at
  // zero, which would read as a failing grade for something it never checked.
  const dimensions = (results?.dimensions || []).filter((d) => typeof d.score === 'number');
  const fixes = results?.fixes || [];
  const remaining = fixes.filter((fix) => !applied.includes(fix.id));
  const pointsLeft = remaining.reduce((sum, fix) => sum + (fix.points || 0), 0);
  const markAllDone = () => setApplied(fixes.map((fix) => fix.id));

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
                  {dimensions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {dimensions.map((d) => (
                        <LabelledBar
                          key={d.key}
                          label={d.label}
                          value={d.score}
                          display={`${Math.round(d.score)}%`}
                          max={100}
                          tone={barTone(d.score)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>
                      {results.message}
                    </p>
                  )}
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
                label={
                  remaining.length === 0
                    ? 'Nothing outstanding'
                    : `${remaining.length} fix${remaining.length === 1 ? '' : 'es'} left`
                }
                right={
                  remaining.length > 0 && (
                    <Button variant="quietClay" onClick={markAllDone}>Mark all done</Button>
                  )
                }
              />

              {fixes.length === 0 ? (
                <Empty>
                  Nothing measurable is holding this back. Send it as it stands.
                </Empty>
              ) : (
                <>
                  {fixes.map((fix, i) => {
                    const done = applied.includes(fix.id);
                    return (
                      <div
                        key={fix.id}
                        style={{
                          padding: '16px 20px',
                          borderBottom: i === fixes.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
                          background: done ? 'var(--color-surface-active)' : 'transparent',
                          transition: 'background-color 120ms ease',
                        }}
                      >
                        <OrdinalRow
                          ordinal={String(i + 1).padStart(2, '0')}
                          right={
                            <button
                              type="button"
                              onClick={() => !done && setApplied((prev) => [...prev, fix.id])}
                              style={{
                                flexShrink: 0,
                                fontFamily: 'var(--font-mono)',
                                fontSize: 11.5,
                                letterSpacing: '0.08em',
                                padding: '6px 10px',
                                borderRadius: 0,
                                background: 'transparent',
                                border: `1px solid ${done ? 'var(--color-green)' : 'var(--color-clay)'}`,
                                color: done ? 'var(--color-green)' : 'var(--color-clay)',
                                cursor: done ? 'default' : 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {done ? 'DONE' : fix.points > 0 ? `+${fix.points} PTS` : 'NOTE'}
                            </button>
                          }
                        >
                          <div
                            style={{
                              fontSize: 15.5,
                              fontWeight: 500,
                              color: done ? 'var(--color-text-4)' : 'var(--color-ink)',
                              textDecoration: done ? 'line-through' : 'none',
                            }}
                          >
                            {fix.title}
                          </div>
                          <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
                            {fix.detail}
                          </p>

                          {/* The scorer quotes back the user's own sentences, so
                              the advice points at something they can find. */}
                          {fix.examples?.length > 0 && !done && (
                            <div style={{ marginTop: 10, borderLeft: '1px solid var(--color-line)', paddingLeft: 12 }}>
                              {fix.examples.map((example) => (
                                <p
                                  key={example}
                                  style={{ fontSize: 13, color: 'var(--color-text-4)', margin: '4px 0', lineHeight: 1.5 }}
                                >
                                  {example}
                                </p>
                              ))}
                            </div>
                          )}
                        </OrdinalRow>
                      </div>
                    );
                  })}

                  <CardFooterNote>
                    {pointsLeft > 0
                      ? `Worth about ${pointsLeft} points if you do all of them. These are edits to make in your own document — EduPath reads it, it does not rewrite it.`
                      : 'These are edits to make in your own document — EduPath reads it, it does not rewrite it.'}
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
