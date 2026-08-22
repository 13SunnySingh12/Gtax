import { cn } from '@/lib/utils';

/** A right-aligned action row under the app header (per-page CTAs). */
export function PageActions({ children, className, description }) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-center justify-between gap-3', className)}>
      <p className="text-caption text-text-muted">{description}</p>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
