import { useCallback, useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/api/client';

/**
 * Small data-fetching hook with loading/error/data + refetch — the shared basis
 * for useIncomes/useExpenses/useTaxEstimate/useDeadlines (frontend §7 hooks/).
 */
export function useAsyncData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mounted.current) setData(result);
    } catch (e) {
      if (mounted.current) setError(apiErrorMessage(e));
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { data, loading, error, refetch: load, setData };
}
