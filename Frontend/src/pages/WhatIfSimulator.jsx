import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { taxApi } from '@/api/tax';
import { apiErrorMessage } from '@/api/client';
import { useTaxEstimate } from '@/hooks/useTaxEstimate';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { WhatIfInputs } from '@/components/whatif/WhatIfInputs';
import { WhatIfComparison } from '@/components/whatif/WhatIfComparison';

const seedFrom = (estimate, navState) => ({
  totalIncome: String(navState?.totalIncome ?? estimate?.totalIncome ?? 0),
  totalExpenses: String(estimate ? Number(estimate.totalIncome) - Number(estimate.taxableIncome) : 0),
  deductibleExpenses: String(navState?.deductibleExpenses ?? estimate?.deductibleExpenses ?? 0),
});

export default function WhatIfSimulator() {
  const { state: navState } = useLocation();
  const { estimate } = useTaxEstimate();

  const [values, setValues] = useState(seedFrom(null, navState));
  const [seeded, setSeeded] = useState(!!navState);
  const [simulated, setSimulated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Seed inputs from the user's real totals once the estimate arrives.
  useEffect(() => {
    if (estimate && !seeded) {
      setValues(seedFrom(estimate, navState));
      setSeeded(true);
    }
  }, [estimate, seeded, navState]);

  const debounced = useDebouncedValue(values, 400);

  const payload = useMemo(
    () => ({
      totalIncome: Number(debounced.totalIncome) || 0,
      totalExpenses: Number(debounced.totalExpenses) || 0,
      deductibleExpenses: Number(debounced.deductibleExpenses) || 0,
    }),
    [debounced],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    taxApi
      .whatIf(payload)
      .then((res) => active && setSimulated(res))
      .catch((e) => active && setError(apiErrorMessage(e, "Couldn't calculate — try again.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [payload]);

  const reset = () => setValues(seedFrom(estimate, null));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <WhatIfInputs values={values} onChange={setValues} onReset={reset} />
      <WhatIfComparison current={estimate} simulated={simulated} loading={loading} error={error} />
    </div>
  );
}
