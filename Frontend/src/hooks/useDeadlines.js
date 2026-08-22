import { deadlinesApi } from '@/api/deadlines';
import { useAsyncData } from './useAsyncData';

export function useDeadlines() {
  const state = useAsyncData(() => deadlinesApi.list(), []);
  return { deadlines: state.data || [], ...state };
}

/** True when any deadline falls within the next `days` (for the nav badge, §4). */
export function hasSoonDeadline(deadlines, days = 7) {
  const now = Date.now();
  const horizon = now + days * 24 * 60 * 60 * 1000;
  return (deadlines || []).some((d) => {
    const t = new Date(d.dueDate).getTime();
    return t >= now && t <= horizon;
  });
}
