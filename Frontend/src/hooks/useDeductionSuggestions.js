import { useCallback, useState } from 'react';
import { expensesApi } from '@/api/expenses';
import { apiErrorMessage } from '@/api/client';

/** On-demand fetch of the AI deduction suggestion for one expense (§10.1). */
export function useDeductionSuggestions() {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFor = useCallback(async (expenseId) => {
    setLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const data = await expensesApi.deductionSuggestions(expenseId);
      setSuggestion(data);
      return data;
    } catch (e) {
      setError(apiErrorMessage(e, "Couldn't fetch a suggestion."));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSuggestion(null);
    setError(null);
  }, []);

  return { suggestion, loading, error, fetchFor, reset };
}
