import { incomesApi } from '@/api/incomes';
import { useAsyncData } from './useAsyncData';

export function useIncomes() {
  const state = useAsyncData(() => incomesApi.list(), []);
  return { incomes: state.data || [], ...state };
}
