import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Remove the extra leading slash and redirect
        const correctedPath = location.pathname.replace(/^\/\//, '/');
        navigate(correctedPath, { replace: true });
    }, [location, navigate]);

    return null; // Don't render anything, just redirect
};

export default ResetPasswordRedirect;
