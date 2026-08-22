import { describe, expect, it } from 'vitest';
import { formatCurrency, formatPercent, relativeTime } from '@/services/currency';

describe('currency formatting', () => {
  it('formats whole amounts without decimals by default', () => {
    expect(formatCurrency(1000)).toMatch(/1,000/);
  });

  it('formats precise amounts with two decimals', () => {
    expect(formatCurrency(1000.5, true)).toMatch(/1,000\.50/);
  });

  it('coerces null/NaN to zero', () => {
    expect(formatCurrency(null)).toMatch(/0/);
    expect(formatCurrency('abc')).toMatch(/0/);
  });

  it('formats percentages', () => {
    expect(formatPercent(5)).toBe('5%');
    expect(formatPercent(2.5)).toBe('2.5%');
  });

  it('produces relative-time labels', () => {
    expect(relativeTime(new Date().toISOString())).toBe('today');
  });
});
