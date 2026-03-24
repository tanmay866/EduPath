import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Template1, Template2, Template3, Template4, Template5,
  Template6, Template7, Template8, Template9, Template10
} from '../component/templates';

const TEMPLATES = {
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

export default function PublicPortfolio() {
  const { portfolioId, username } = useParams();
  const location = useLocation();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // Determine if this is a /p/:portfolioId route or /:username route
        const isIdRoute = location.pathname.startsWith('/p/');
        const apiUrl = isIdRoute
          ? `http://localhost:4000/api/portfolio/${portfolioId}`
          : `http://localhost:4000/api/portfolio/u/${username}`;

        const res = await fetch(apiUrl);
        const result = await res.json();
        if (!result.success) {
          setError(result.message || 'Portfolio not found');
        } else {
          setPortfolio(result.portfolio);
        }
      } catch (err) {
        setError('Failed to load portfolio. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [portfolioId, username, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Portfolio Not Found</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
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
    skills: portfolio.skills || [],
    experience: portfolio.experience || [],
    education: portfolio.education || [],
    projects: portfolio.projects || [],
    certifications: portfolio.certifications || [],
    achievements: portfolio.achievements || [],
  };

  const templateKey = portfolio.template?.toLowerCase() || 'template1';
  const TemplateComponent = TEMPLATES[templateKey] || Template1;

  return <TemplateComponent data={data} />;
}
