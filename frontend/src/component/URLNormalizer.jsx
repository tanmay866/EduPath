import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Rewrites a doubled leading slash, so `//roadmap` lands on `/roadmap`
 * instead of a blank router miss.
 */
const URLNormalizer = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('//')) {
      const normalizedPath = location.pathname.substring(1);
      navigate(normalizedPath + location.search + location.hash, { replace: true });
    }
  }, [location, navigate]);

  return children;
};

export default URLNormalizer;
