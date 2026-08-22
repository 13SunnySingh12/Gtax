import { cn } from '@/lib/utils';

export function Progress({ value = 0, className }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}
