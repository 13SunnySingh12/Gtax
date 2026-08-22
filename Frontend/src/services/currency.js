// Shared amount/percentage formatting (frontend §7). tabular-nums friendly.

const nf = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const nfPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value, precise = false) {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return precise ? nfPrecise.format(0) : nf.format(0);
  return precise ? nfPrecise.format(n) : nf.format(n);
}

export function formatPercent(value) {
  const n = Number(value ?? 0);
  return `${n % 1 === 0 ? n : n.toFixed(1)}%`;
}

export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** "3 days ago" style relative label for timestamps. */
export function relativeTime(value) {
  if (!value) return '';
  const then = new Date(value).getTime();
  const diffDays = Math.round((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.round(diffDays / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}
