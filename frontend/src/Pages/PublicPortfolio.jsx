import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { API_URL } from '../config';
import {
  TemplateEditorial,
  Template1, Template2, Template3, Template4, Template5,
  Template6, Template7, Template8, Template9, Template10
} from '../component/templates';
import { Card, Loading, Empty, Button } from '../design';

const TEMPLATES = {
  editorial: TemplateEditorial,
  template1: Template1,
  template2: Template2,
  template3: Template3,
  template4: Template4,
  template5: Template5,
  template6: Template6,
  template7: Template7,
  template8: Template8,
  template9: Template9,
  template10: Template10,
};

const API_BASE = API_URL;

export default function PublicPortfolio() {
  const { portfolioId, username } = useParams();
  const location = useLocation();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const isIdRoute = location.pathname.startsWith('/p/');
        const apiUrl = isIdRoute
          ? `${API_BASE}/api/portfolio/${portfolioId}`
          : `${API_BASE}/api/portfolio/u/${username}`;

        const res = await fetch(apiUrl);
        const result = await res.json();
        if (!result.success) {
          setError(result.message || 'Portfolio not found');
        } else {
          setPortfolio(result.portfolio);
        }
      } catch {
        setError('Failed to load portfolio. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [portfolioId, username, location.pathname]);

  // The states around the portfolio are EduPath's, so they follow §5 — card
  // chrome with a mono label, no spinner and no shimmer. What loads inside is
  // the owner's own page and keeps whatever template they chose.
  const state = (children) => (
    <div
      style={{
        background: 'var(--color-paper)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>
        <Card>{children}</Card>
      </div>
    </div>
  );

  if (loading) return state(<Loading label="Loading portfolio" />);

  if (error) {
    return state(
      <Empty action={<Button onClick={() => { window.location.href = '/'; }}>Go to EduPath</Button>}>
        {error}
      </Empty>
    );
  }

  // Flatten personalInfo into a single data object that templates expect
  const data = {
    ...(portfolio.personalInfo || {}),
    name: portfolio.personalInfo?.name,
    title: portfolio.personalInfo?.title,
    email: portfolio.personalInfo?.email,
    phone: portfolio.personalInfo?.phone,
    location: portfolio.personalInfo?.location,
    about: portfolio.personalInfo?.about,
    github: portfolio.personalInfo?.github,
    linkedin: portfolio.personalInfo?.linkedin,
    portfolio: portfolio.personalInfo?.portfolio,
    skills: portfolio.skills || [],
    experience: portfolio.experience || [],
    education: portfolio.education || [],
    projects: portfolio.projects || [],
    certifications: portfolio.certifications || [],
    achievements: portfolio.achievements || [],
  };

  const templateKey = portfolio.template?.toLowerCase() || 'editorial';
  const TemplateComponent = TEMPLATES[templateKey] || TemplateEditorial;

  return <TemplateComponent data={data} />;
}
