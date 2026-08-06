import { useState, useEffect } from 'react';
import { API_BASE as API_ROOT } from '../../config';
import { useNavigate } from 'react-router-dom';
import {
  TemplateEditorial,
  Template1, Template2, Template3, Template4, Template5,
  Template6, Template7, Template8, Template9, Template10
} from '../templates';
import {
  LearnerShell, Card, CardHeader, Button, Field, Input, Toggle, InlineMessage,
  MicroLabel, Badge, RuledGrid, RuledCell, Loading, Empty, type, formatPhone, PhoneInput,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

const TEMPLATES_MAP = {
  editorial: TemplateEditorial,
  template1: Template1, template2: Template2, template3: Template3,
  template4: Template4, template5: Template5, template6: Template6,
  template7: Template7, template8: Template8, template9: Template9,
  template10: Template10
};

// The gradient and ring classes the picker used to render with are gone — the
// EduPath chrome around the picker follows the spec even though the themes
// themselves stay colourful, since a template is the user's own site.
// Editorial leads the list and is the default: it is the published portfolio
// the spec describes, and the ten themes remain for anyone who wants one.
const TEMPLATE_META = [
  { key: 'editorial', name: 'Editorial', desc: 'The EduPath house style' },
  { key: 'template1', name: 'Ocean Blue', desc: 'Professional blue' },
  { key: 'template2', name: 'Sunset Orange', desc: 'Creative warm orange' },
  { key: 'template3', name: 'Forest Green', desc: 'Natural green' },
  { key: 'template4', name: 'Royal Purple', desc: 'Purple and pink' },
  { key: 'template5', name: 'Midnight Dark', desc: 'Modern dark mode' },
  { key: 'template6', name: 'Teal Aqua', desc: 'Fresh teal' },
  { key: 'template7', name: 'Rose Pink', desc: 'Elegant and stylish' },
  { key: 'template8', name: 'Amber Gold', desc: 'Warm and professional' },
  { key: 'template9', name: 'Slate Gray', desc: 'Minimalist' },
  { key: 'template10', name: 'Indigo Violet', desc: 'Creative, tech-leaning' }
];

const API_BASE = `${API_ROOT}/portfolio`;

function PortfolioGenerator() {
  const navigate = useNavigate();

  // Views: 'home' | 'create' | 'deployed'
  const [view, setView] = useState('home');
  const [currentStep, setCurrentStep] = useState(1); // 1=Upload, 2=Review, 3=Template

  // Portfolio data
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [portfolioData, setPortfolioData] = useState({
    name: '', title: '', email: '', phone: '', location: '', about: '',
    github: '', linkedin: '', portfolio: '', profilePhoto: '',
    experience: [], education: [], skills: [], projects: [],
    certifications: [], achievements: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState('editorial');

  // Deployed portfolio data
  const [deployedPortfolio, setDeployedPortfolio] = useState(null);
  const [portfolioLink, setPortfolioLink] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [vercelDeploying, setVercelDeploying] = useState(false);
  const [copied, setCopied] = useState('');

  // My Portfolios
  const [myPortfolios, setMyPortfolios] = useState([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);
  const [liveOnly, setLiveOnly] = useState(false);

  // The skill input used to be read straight off the DOM node; it is state now
  // so the Add button and the Enter key share one value.
  const [skillDraft, setSkillDraft] = useState('');

  const token = sessionStorage.getItem('token');

  // Check authentication on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchMyPortfolios();
  }, [navigate]);

  const fetchMyPortfolios = async () => {
    setLoadingPortfolios(true);
    try {
      const res = await fetch(`${API_BASE}/my-portfolios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setMyPortfolios(result.portfolios || []);
    } catch (err) {
      console.error('Fetch portfolios error:', err);
    } finally {
      setLoadingPortfolios(false);
    }
  };

  // ────── Resume Upload ──────
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!validTypes.includes(file.type)) { setError('Please upload a PDF or DOCX file'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return; }

    setResumeFile(file);
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch(`${API_BASE}/parse-resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setPortfolioData(prev => ({
          ...prev, ...result.data,
          experience: result.data.experience || [],
          education: result.data.education || [],
          skills: result.data.skills || [],
          projects: result.data.projects || [],
          certifications: result.data.certifications || [],
          achievements: result.data.achievements || []
        }));
        setResumeParsed(true);
        setTimeout(() => setCurrentStep(2), 800);
      } else {
        setError(result.message || 'Failed to parse resume');
      }
    } catch {
      setError('Failed to process resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ────── Data Handlers ──────
  const handleDataUpdate = (field, value) => setPortfolioData(prev => ({ ...prev, [field]: value }));
  const handleArrayAdd = (field, template) => setPortfolioData(prev => ({ ...prev, [field]: [...prev[field], template] }));
  const handleArrayRemove = (field, index) => setPortfolioData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  const handleArrayUpdate = (field, index, key, value) => {
    setPortfolioData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? (typeof key === 'string' ? { ...item, [key]: value } : value) : item)
    }));
  };
  const handleAddSkill = (skill) => {
    if (skill && !portfolioData.skills.includes(skill)) {
      setPortfolioData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };
  const handleRemoveSkill = (skill) => setPortfolioData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

  // ────── Profile Photo Upload ──────
  const handleProfilePhotoUpload = (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) { setError('Please upload a JPG, PNG, or WebP image'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Photo size must be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPortfolioData(prev => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ────── Deploy to MongoDB ──────
  const handleDeploy = async () => {
    if (!portfolioData.name || !portfolioData.title) { setError('Name and Title are required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ portfolioData, template: selectedTemplate })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        const url = result.username
          ? `${window.location.origin}/${result.username}`
          : `${window.location.origin}/p/${result.portfolioId}`;
        setPortfolioLink(url);
        setDeployedPortfolio(result.portfolio);
        setView('deployed');
        setSuccessMsg('Portfolio deployed successfully!');
        fetchMyPortfolios();
      } else {
        setError(result.message || 'Deployment failed');
      }
    } catch {
      setError('Failed to deploy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ────── Deploy to Vercel ──────
  const handleDeployToVercel = async (portfolioId) => {
    setVercelDeploying(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/deploy-vercel/${portfolioId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setVercelUrl(result.vercelUrl);
        setSuccessMsg('Deployed to Vercel! Your portfolio is live.');
        fetchMyPortfolios();
      } else {
        setError(result.message || 'Vercel deployment failed');
      }
    } catch {
      setError('Vercel deployment failed. Please try again.');
    } finally {
      setVercelDeploying(false);
    }
  };

  // ────── Delete Portfolio ──────
  const handleDeletePortfolio = async (portfolioId) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return;
    try {
      const res = await fetch(`${API_BASE}/${portfolioId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg('Portfolio deleted');
        fetchMyPortfolios();
      }
    } catch {
      setError('Failed to delete portfolio');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleCreateNew = () => {
    setPortfolioData({
      name: '', title: '', email: '', phone: '', location: '', about: '',
      github: '', linkedin: '', portfolio: '', profilePhoto: '',
      experience: [], education: [], skills: [], projects: [],
      certifications: [], achievements: []
    });
    setSelectedTemplate('editorial');
    setResumeFile(null);
    setResumeParsed(false);
    setPortfolioLink('');
    setVercelUrl('');
    setDeployedPortfolio(null);
    setCurrentStep(1);
    setView('create');
    setError('');
    setSuccessMsg('');
  };

  const shell = (title, children, headerNote) => (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Build"
      title={title}
      note={headerNote ?? sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      {error && <InlineMessage tone="error">{error}</InlineMessage>}
      {successMsg && <InlineMessage tone="success">{successMsg}</InlineMessage>}
      {children}
    </LearnerShell>
  );

  // ════════════════════════════════════════════
  //  HOME: the portfolios you have
  // ════════════════════════════════════════════
  if (view === 'home') {
    const visible = liveOnly ? myPortfolios.filter((p) => p.vercelDeployment?.url) : myPortfolios;
    const liveCount = myPortfolios.filter((p) => p.vercelDeployment?.url).length;

    return shell('Portfolio', (
      <>
        {/* Status bar — spec §7: a 16px/600 line and a count left, a toggle and
            a primary right. */}
        <Card style={{ padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
              {myPortfolios.length === 0
                ? 'No portfolio yet'
                : liveCount > 0
                  ? `${liveCount} live on Vercel`
                  : 'Saved, not yet deployed'}
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--color-text-3)', marginTop: 4 }}>
              {`${myPortfolios.length} portfolio${myPortfolios.length === 1 ? '' : 's'} · `}
              {`${myPortfolios.reduce((s, p) => s + (p.views || 0), 0)} views`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">Live only</MicroLabel>
              <Toggle checked={liveOnly} onChange={setLiveOnly} label="Show only live portfolios" />
            </div>
            <Button onClick={handleCreateNew}>New portfolio</Button>
          </div>
        </Card>

        {loadingPortfolios ? (
          <Card><Loading /></Card>
        ) : myPortfolios.length === 0 ? (
          <Card>
            <Empty action={<Button onClick={handleCreateNew}>Create your first</Button>}>
              Upload a resume and EduPath builds a portfolio site from it.
            </Empty>
          </Card>
        ) : visible.length === 0 ? (
          <Card>
            <Empty>None of your portfolios are deployed to Vercel yet.</Empty>
          </Card>
        ) : (
          <RuledGrid columns={3}>
            {visible.map((p) => {
              const tmpl = TEMPLATE_META.find((t) => t.key === p.template) || TEMPLATE_META[0];
              const live = Boolean(p.vercelDeployment?.url);
              const publicUrl = p.username
                ? `${window.location.origin}/${p.username}`
                : `${window.location.origin}/p/${p.portfolioId}`;

              return (
                <RuledCell key={p.portfolioId} style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">{tmpl.name}</MicroLabel>
                    <Badge tone={live ? 'green' : 'muted'}>{live ? 'LIVE' : 'DRAFT'}</Badge>
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 23,
                      fontWeight: 400,
                      letterSpacing: '-0.015em',
                      lineHeight: 1.2,
                      color: 'var(--color-ink)',
                      marginTop: 14,
                    }}
                  >
                    {p.personalInfo?.name || 'Unnamed'}
                  </div>

                  <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.5, margin: '8px 0 0', minHeight: 62 }}>
                    {p.personalInfo?.title || 'No job title set.'}
                  </p>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-4)', marginTop: 4 }}>
                    {`${p.views || 0} VIEWS · ${new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
                    {live ? (
                      <Button
                        variant="secondary"
                        style={{ padding: '9px 16px', fontSize: 13.5 }}
                        onClick={() => window.open(p.vercelDeployment.url, '_blank', 'noopener')}
                      >
                        Vercel URL
                      </Button>
                    ) : (
                      <Button
                        style={{ padding: '9px 16px', fontSize: 13.5 }}
                        onClick={() => handleDeployToVercel(p.portfolioId)}
                        loading={vercelDeploying}
                        loadingLabel="Deploying…"
                      >
                        Publish
                      </Button>
                    )}

                    <Button variant="quiet" onClick={() => window.open(publicUrl, '_blank', 'noopener')}>Visit</Button>
                    <Button variant="quiet" onClick={() => copyToClipboard(publicUrl, p.portfolioId)}>
                      {copied === p.portfolioId ? 'Copied' : 'Copy link'}
                    </Button>
                    <Button variant="quietClay" onClick={() => handleDeletePortfolio(p.portfolioId)}>Delete</Button>
                  </div>
                </RuledCell>
              );
            })}
          </RuledGrid>
        )}
      </>
    ));
  }

  // ════════════════════════════════════════════
  //  DEPLOYED: the links for what was just published
  // ════════════════════════════════════════════
  if (view === 'deployed') {
    const LinkRow = ({ label, url, copyKey }) => (
      <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--color-line-soft)' }}>
        <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
          {label}
        </MicroLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-ink)', wordBreak: 'break-all' }}
          >
            {url}
          </a>
          <Button variant="quiet" onClick={() => copyToClipboard(url, copyKey)} style={{ flexShrink: 0 }}>
            {copied === copyKey ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    );

    return shell('Portfolio published', (
      <div style={{ maxWidth: 700 }}>
        <Card>
          <CardHeader
            label="Live"
            right={<Button variant="quiet" onClick={() => setView('home')}>All portfolios</Button>}
          />

          <div style={{ padding: '26px 22px 22px' }}>
            <h2 style={{ ...type.cardHeading, margin: 0, color: 'var(--color-ink)' }}>
              Your portfolio is online
            </h2>
            <p style={{ ...type.body, margin: '10px 0 0' }}>
              Share the link below. Deploying to Vercel gives it a permanent address that does not
              depend on EduPath staying up.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--color-line)' }}>
            <LinkRow label="EduPath link" url={portfolioLink} copyKey="local" />
            {vercelUrl && <LinkRow label="Vercel link" url={vercelUrl} copyKey="vercel" />}
          </div>

          <div style={{ padding: '18px 22px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!vercelUrl && (
              <Button
                onClick={() => handleDeployToVercel(deployedPortfolio?.portfolioId)}
                loading={vercelDeploying}
                loadingLabel="Deploying…"
              >
                Deploy to Vercel
              </Button>
            )}
            <Button variant="secondary" onClick={() => { setView('create'); setCurrentStep(2); }}>Edit content</Button>
            <Button variant="secondary" onClick={() => { setView('create'); setCurrentStep(3); }}>Change template</Button>
          </div>
        </Card>
      </div>
    ));
  }

  // ════════════════════════════════════════════
  //  CREATE: upload → review → template
  // ════════════════════════════════════════════
  const stepLabels = ['Upload resume', 'Review details', 'Choose template'];

  return shell('New portfolio', (
    <>
      {/* Step indicator — the §5 segmented filter, since a step is just a
          selection whose later options are not reachable yet. */}
      <Card style={{ padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex' }}>
          {stepLabels.map((label, i) => {
            const step = i + 1;
            const reachable = step < currentStep;
            const selected = step === currentStep;
            return (
              <button
                key={label}
                type="button"
                onClick={() => reachable && setCurrentStep(step)}
                disabled={!reachable && !selected}
                style={{
                  padding: '8px 14px',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  border: '1px solid var(--color-line)',
                  marginLeft: i === 0 ? 0 : -1,
                  background: selected ? 'var(--color-ink)' : '#fff',
                  color: selected ? '#fff' : reachable ? 'var(--color-text-3)' : 'var(--color-text-4)',
                  cursor: reachable ? 'pointer' : 'default',
                  borderRadius: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginRight: 9, opacity: 0.75 }}>
                  {String(step).padStart(2, '0')}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        <Button variant="quiet" onClick={() => setView('home')}>Cancel</Button>
      </Card>

      {/* ── Step 1: upload ── */}
      {currentStep === 1 && (
        <Card>
          <CardHeader label="Upload resume" />
          <div style={{ padding: '26px 24px' }}>
            <p style={{ ...type.body, margin: '0 0 20px' }}>
              EduPath reads your resume and fills in the portfolio for you. You can correct
              anything it gets wrong on the next step.
            </p>

            <label
              style={{
                display: 'block',
                padding: '40px 20px',
                border: '1px solid var(--color-line-input)',
                background: '#fff',
                cursor: loading ? 'wait' : 'pointer',
                textAlign: 'center',
              }}
            >
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={loading} style={{ display: 'none' }} />
              <span style={{ fontSize: 15.5, color: resumeFile ? 'var(--color-ink)' : 'var(--color-text-2)', display: 'block' }}>
                {resumeFile ? resumeFile.name : 'Choose a file, or drop one here'}
              </span>
              <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-4)', marginTop: 8 }}>
                PDF · DOC · DOCX · UP TO 10MB
              </span>
            </label>

            {loading && <Loading label="Reading your resume" />}
            {resumeParsed && !loading && (
              <div style={{ marginTop: 16 }}>
                <InlineMessage tone="success">Resume read. Taking you to the details…</InlineMessage>
              </div>
            )}
          </div>

          <div style={{ padding: '18px 24px', borderTop: '1px solid var(--color-line)' }}>
            <Button variant="quiet" onClick={() => setCurrentStep(2)}>Skip — I will fill it in myself</Button>
          </div>
        </Card>
      )}

      {/* ── Step 2: review ── */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Section label="Profile photo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div
                style={{
                  width: 84,
                  height: 84,
                  flexShrink: 0,
                  border: '1px solid var(--color-line)',
                  background: 'var(--color-surface-active)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {portfolioData.profilePhoto ? (
                  <img src={portfolioData.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <MicroLabel size={10} tracking="0.13em" color="var(--color-text-4)">None</MicroLabel>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleProfilePhotoUpload(file); }}
                  style={{
                    display: 'block',
                    padding: '18px',
                    border: '1px solid var(--color-line-input)',
                    background: '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files[0]) handleProfilePhotoUpload(e.target.files[0]); }}
                  />
                  <span style={{ fontSize: 14.5, color: 'var(--color-text-2)' }}>
                    {portfolioData.profilePhoto ? 'Choose a different photo' : 'Choose or drop a photo'}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-4)', marginTop: 6 }}>
                    JPG · PNG · WEBP · UP TO 5MB
                  </span>
                </label>

                {portfolioData.profilePhoto && (
                  <div style={{ marginTop: 10 }}>
                    <Button variant="quietClay" onClick={() => setPortfolioData((prev) => ({ ...prev, profilePhoto: '' }))}>
                      Remove photo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section label="About you">
            <div style={TWO_UP}>
              <PortfolioField label="Full name *" value={portfolioData.name} onChange={(v) => handleDataUpdate('name', v)} placeholder="Tanmay Patel" />
              <PortfolioField label="Job title *" value={portfolioData.title} onChange={(v) => handleDataUpdate('title', v)} placeholder="Full Stack Developer" />
              <PortfolioField label="Email" type="email" value={portfolioData.email} onChange={(v) => handleDataUpdate('email', v)} placeholder="you@example.com" />
              <Field label="Phone">
                <PhoneInput name="phone" value={portfolioData.phone} onChange={(e) => handleDataUpdate('phone', e.target.value)} />
              </Field>
              <PortfolioField label="Location" value={portfolioData.location} onChange={(v) => handleDataUpdate('location', v)} placeholder="Ahmedabad, India" />
              <PortfolioField label="GitHub" value={portfolioData.github} onChange={(v) => handleDataUpdate('github', v)} placeholder="github.com/you" />
              <PortfolioField label="LinkedIn" value={portfolioData.linkedin} onChange={(v) => handleDataUpdate('linkedin', v)} placeholder="linkedin.com/in/you" />
              <PortfolioField label="Website" value={portfolioData.portfolio} onChange={(v) => handleDataUpdate('portfolio', v)} placeholder="yoursite.com" />
            </div>

            <Field label="About">
              <textarea
                value={portfolioData.about}
                onChange={(e) => handleDataUpdate('about', e.target.value)}
                rows={4}
                placeholder="A few sentences on what you do and what you are looking for"
                style={TEXTAREA}
              />
            </Field>
          </Section>

          <Section
            label="Experience"
            onAdd={() => handleArrayAdd('experience', { company: '', position: '', duration: '', description: '' })}
            addLabel="Add role"
          >
            {portfolioData.experience.length === 0 && <Empty>No roles added.</Empty>}
            {portfolioData.experience.map((exp, i) => (
              <Entry key={i} ordinal={i + 1} onRemove={() => handleArrayRemove('experience', i)}>
                <div style={TWO_UP}>
                  <PortfolioField label="Position" value={exp.position} onChange={(v) => handleArrayUpdate('experience', i, 'position', v)} placeholder="Full Stack Developer" />
                  <PortfolioField label="Company" value={exp.company} onChange={(v) => handleArrayUpdate('experience', i, 'company', v)} placeholder="Acme Ltd" />
                </div>
                <PortfolioField label="Duration" value={exp.duration} onChange={(v) => handleArrayUpdate('experience', i, 'duration', v)} placeholder="2024 – 2026" />
                <Field label="Description">
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleArrayUpdate('experience', i, 'description', e.target.value)}
                    rows={3}
                    placeholder="What you did there"
                    style={TEXTAREA}
                  />
                </Field>
              </Entry>
            ))}
          </Section>

          <Section
            label="Education"
            onAdd={() => handleArrayAdd('education', { degree: '', institution: '', year: '', cgpa: '' })}
            addLabel="Add education"
          >
            {portfolioData.education.length === 0 && <Empty>No education added.</Empty>}
            {portfolioData.education.map((edu, i) => (
              <Entry key={i} ordinal={i + 1} onRemove={() => handleArrayRemove('education', i)}>
                <PortfolioField label="Degree" value={edu.degree} onChange={(v) => handleArrayUpdate('education', i, 'degree', v)} placeholder="B.E. Computer Engineering" />
                <div style={TWO_UP}>
                  <PortfolioField label="Institution" value={edu.institution} onChange={(v) => handleArrayUpdate('education', i, 'institution', v)} placeholder="Gujarat Technological University" />
                  <PortfolioField label="Year" value={edu.year} onChange={(v) => handleArrayUpdate('education', i, 'year', v)} placeholder="2026" />
                </div>
              </Entry>
            ))}
          </Section>

          <Section label="Skills">
            {portfolioData.skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {portfolioData.skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    title="Remove"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11.5,
                      padding: '5px 9px',
                      border: '1px solid var(--color-line-btn)',
                      background: '#fff',
                      color: 'var(--color-text-2)',
                      cursor: 'pointer',
                      borderRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {skill}
                    <span style={{ color: 'var(--color-text-4)' }}>×</span>
                  </button>
                ))}
              </div>
            )}

            <Field label="Add a skill" help="Press Enter to add it to the list.">
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(skillDraft.trim()); setSkillDraft(''); }
                  }}
                  placeholder="React"
                />
                <Button
                  variant="secondary"
                  onClick={() => { handleAddSkill(skillDraft.trim()); setSkillDraft(''); }}
                  style={{ padding: '13px 18px', flexShrink: 0 }}
                >
                  Add
                </Button>
              </div>
            </Field>
          </Section>

          <Section
            label="Projects"
            onAdd={() => handleArrayAdd('projects', { name: '', description: '', technologies: [], link: '' })}
            addLabel="Add project"
          >
            {portfolioData.projects.length === 0 && <Empty>No projects added.</Empty>}
            {portfolioData.projects.map((proj, i) => (
              <Entry key={i} ordinal={i + 1} onRemove={() => handleArrayRemove('projects', i)}>
                <PortfolioField label="Name" value={proj.name} onChange={(v) => handleArrayUpdate('projects', i, 'name', v)} placeholder="EduPath" />
                <Field label="Description">
                  <textarea
                    value={proj.description}
                    onChange={(e) => handleArrayUpdate('projects', i, 'description', e.target.value)}
                    rows={3}
                    placeholder="What it does and what you built"
                    style={TEXTAREA}
                  />
                </Field>
                <div style={TWO_UP}>
                  <PortfolioField
                    label="Technologies"
                    value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''}
                    onChange={(v) => handleArrayUpdate('projects', i, 'technologies', v.split(',').map((t) => t.trim()))}
                    placeholder="React, Node.js, MongoDB"
                  />
                  <PortfolioField label="Link" value={proj.link || ''} onChange={(v) => handleArrayUpdate('projects', i, 'link', v)} placeholder="github.com/you/edupath" />
                </div>
              </Entry>
            ))}
          </Section>

          <Section label="Certifications" onAdd={() => handleArrayAdd('certifications', '')} addLabel="Add certification">
            {portfolioData.certifications.length === 0 && <Empty>No certifications added.</Empty>}
            {portfolioData.certifications.map((cert, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  value={cert}
                  onChange={(e) => handleArrayUpdate('certifications', i, null, e.target.value)}
                  placeholder="AWS Certified Cloud Practitioner"
                />
                <Button variant="quietClay" onClick={() => handleArrayRemove('certifications', i)} style={{ flexShrink: 0 }}>
                  Remove
                </Button>
              </div>
            ))}
          </Section>

          <Section label="Achievements" onAdd={() => handleArrayAdd('achievements', '')} addLabel="Add achievement">
            {portfolioData.achievements.length === 0 && <Empty>No achievements added.</Empty>}
            {portfolioData.achievements.map((ach, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  value={ach}
                  onChange={(e) => handleArrayUpdate('achievements', i, null, e.target.value)}
                  placeholder="Won the 2026 university hackathon"
                />
                <Button variant="quietClay" onClick={() => handleArrayRemove('achievements', i)} style={{ flexShrink: 0 }}>
                  Remove
                </Button>
              </div>
            ))}
          </Section>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              onClick={() => {
                if (!portfolioData.name || !portfolioData.title) {
                  setError('Please fill in name and job title before continuing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                setError('');
                setCurrentStep(3);
              }}
            >
              Choose a template
            </Button>
            <Button variant="secondary" onClick={() => setCurrentStep(1)}>Re-upload resume</Button>
          </div>
        </div>
      )}

      {/* ── Step 3: template ── */}
      {currentStep === 3 && (
        <div className="stack-sm" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 22, alignItems: 'start' }}>
          <Card>
            <CardHeader
              label="Templates"
              right={
                <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
                  {`${TEMPLATE_META.length} THEMES`}
                </MicroLabel>
              }
            />
            {TEMPLATE_META.map((tmpl, i) => {
              const isSelected = selectedTemplate === tmpl.key;
              return (
                <div
                  key={tmpl.key}
                  onClick={() => setSelectedTemplate(tmpl.key)}
                  style={{
                    padding: '14px 20px',
                    borderBottom: i === TEMPLATE_META.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
                    borderLeft: `3px solid ${isSelected ? 'var(--color-clay)' : 'transparent'}`,
                    background: isSelected ? 'var(--color-surface-active)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 120ms ease',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: isSelected ? 600 : 400, color: 'var(--color-ink)' }}>
                    {tmpl.name}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--color-text-3)', marginTop: 3 }}>{tmpl.desc}</div>
                </div>
              );
            })}
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Card>
              <CardHeader
                label="Preview"
                right={<Button variant="quiet" onClick={() => setCurrentStep(2)}>Back to details</Button>}
              />
              {/* The template itself is the user's site, not EduPath chrome, so it
                  keeps its own colours inside this frame. */}
              <p className="wide-screen-note">
                This is your published site at desktop width. It is easier to judge on a wider screen.
              </p>
              <div style={{ maxHeight: 560, overflowY: 'auto', borderTop: '1px solid var(--color-line)' }}>
                {(() => {
                  const TemplateComp = TEMPLATES_MAP[selectedTemplate] || TemplateEditorial;
                  // The country code is put back here rather than in each of
                  // the eleven templates, which all just print `data.phone`.
                  return <TemplateComp data={{ ...portfolioData, phone: formatPhone(portfolioData.phone) }} />;
                })()}
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button onClick={handleDeploy} loading={loading} loadingLabel="Publishing…">
                Publish portfolio
              </Button>
              <Button variant="secondary" onClick={() => setView('home')}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  ));
}

/* ── Local building blocks ────────────────────────────────────────────────
   Section and Entry mirror the resume builder's, so the two Build screens
   read as one family. */
const TEXTAREA = {
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
};

// auto-fit rather than a hard 1fr 1fr: below roughly 420px two columns
// leave each field too narrow to read what is typed in it, so the pair
// becomes one column on its own.
const TWO_UP = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20 };

function Section({ label, onAdd, addLabel, children }) {
  return (
    <Card>
      <CardHeader
        label={label}
        right={onAdd && <Button variant="quietClay" onClick={onAdd}>{addLabel}</Button>}
      />
      <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
    </Card>
  );
}

function Entry({ ordinal, onRemove, children }) {
  return (
    <div style={{ borderTop: ordinal > 1 ? '1px solid var(--color-line-soft)' : 'none', paddingTop: ordinal > 1 ? 20 : 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <MicroLabel size={10.5} tracking="0.13em" color="var(--color-clay)">
          {String(ordinal).padStart(2, '0')}
        </MicroLabel>
        {onRemove && <Button variant="quiet" onClick={onRemove}>Remove</Button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
    </div>
  );
}

function PortfolioField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <Field label={label}>
      <Input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </Field>
  );
}

export default PortfolioGenerator;
