import { taxApi } from '@/api/tax';
import { useAsyncData } from './useAsyncData';

export function useTaxEstimate() {
  const state = useAsyncData(() => taxApi.estimate(), []);
  return { estimate: state.data, ...state };
}
