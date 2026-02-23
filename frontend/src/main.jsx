import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { QuizProvider } from './Pages/context/QuizContext'

// Component to fix double slash URLs
const URLNormalizer = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fix double slash at the start of pathname
    if (location.pathname.startsWith('//')) {
      const normalizedPath = location.pathname.substring(1);
      navigate(normalizedPath + location.search + location.hash, { replace: true });
    }
  }, [location, navigate]);

  return children;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <URLNormalizer>
        <QuizProvider>
          <App />
        </QuizProvider>
      </URLNormalizer>
    </BrowserRouter>

  </StrictMode>,
)
