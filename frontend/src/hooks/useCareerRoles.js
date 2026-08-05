import { useEffect, useState } from 'react';
import API from '../Pages/Services/assessmentService';

/**
 * The career tracks a roadmap can be built for, fetched from the API.
 *
 * Deliberately not a local constant: a second copy of this list on the client
 * is how the role vocabularies drifted apart before, and the values have to
 * match the AI service's templates exactly to mean anything.
 */
export const useCareerRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    API.get('/career-roles')
      .then((response) => {
        if (!active) return;
        setRoles(response.data?.data || []);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to load career roles:', err);
        setError('Could not load the list of roles.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { roles, loading, error };
};

export default useCareerRoles;
