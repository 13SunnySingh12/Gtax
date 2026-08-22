import { cn } from '@/lib/utils';

/**
 * The G-TAX brand logo (real vector at /logo.svg) with an optional wordmark.
 * Served from public/ as an <img> so the 500x500 SVG stays out of the JS bundle
 * and is browser-cached. Use `withWordmark={false}` for the mark alone.
 */
export function Logo({ size = 36, withWordmark = true, wordmarkClassName, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img
        src="/logo.svg"
        alt="G-TAX logo"
        width={size}
        height={size}
        className="shrink-0"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className={cn('font-semibold text-primary', wordmarkClassName || 'text-heading')}>
          G-TAX
        </span>
      )}
    </span>
  );
}
