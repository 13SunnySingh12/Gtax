import { useEffect, useState } from 'react';

/** Debounce a value — used for the live what-if recalculation (§8.6, ~400ms). */
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
