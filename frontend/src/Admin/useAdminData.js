import { useCallback, useEffect, useState } from 'react';

/**
 * Load one admin endpoint, and keep the three states it can be in.
 *
 * Every admin screen needs the same loading / failed / loaded handling, and
 * the failure case matters here more than elsewhere: these requests are
 * refused outright unless the account itself carries the admin role, so
 * "nothing rendered" has to be distinguishable from "no records".
 */
export const useAdminData = (loader) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load, setData };
};

export default useAdminData;
