import { createContext, useContext } from 'react';

/**
 * Exposes the results of the pre-dashboard bootstrap (health, profile, AI
 * availability) to the authenticated app — e.g. the Dashboard's AI banner and
 * the Profile page. Populated by AppGate once everything is ready.
 */
export const BootstrapContext = createContext(null);

export function useBootstrapContext() {
  const ctx = useContext(BootstrapContext);
  if (!ctx) throw new Error('useBootstrapContext must be used within AppGate');
  return ctx;
}
