import { expensesApi } from '@/api/expenses';
import { useAsyncData } from './useAsyncData';

export function useExpenses() {
  const state = useAsyncData(() => expensesApi.list(), []);
  return { expenses: state.data || [], ...state };
}
