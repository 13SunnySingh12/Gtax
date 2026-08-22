import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LoadingScreen } from '@/components/bootstrap/LoadingScreen';

/**
 * Guards the app's single loading state: it must use the shared loader animation
 * and say "Loading" - never the old "Preparing your dashboard" wording.
 */
describe('LoadingScreen', () => {
  const html = renderToStaticMarkup(<LoadingScreen />);

  it('renders the shared loader animation', () => {
    expect(html).toContain('loader');
    expect(html).toContain('longfazers');
    expect(html).toContain('base');
    expect(html).toContain('face');
  });

  it('says "Loading"', () => {
    expect(html).toContain('Loading');
  });

  it('never says "Preparing"', () => {
    expect(html).not.toMatch(/Preparing/i);
  });

  it('announces itself to screen readers', () => {
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
  });
});
