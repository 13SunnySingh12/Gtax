import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Slide-over drawer. Anchors right by default (expense detail panel, §8.4) or
 * left (the mobile navigation drawer). When `title` is omitted the header is
 * skipped and a floating close button is shown instead; `bodyClassName` lets a
 * caller take full control of the content area (e.g. a full-bleed gradient).
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  className,
  side = 'right',
  bodyClassName,
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onOpenChange(false);
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => panelRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const isLeft = side === 'left';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' && title ? title : 'Menu'}
        tabIndex={-1}
        className={cn(
          'absolute top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl',
          isLeft ? 'left-0 border-r border-border' : 'right-0 border-l border-border',
          className,
        )}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-heading text-ink">{title}</h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-text-muted hover:bg-sidebar"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 z-20 rounded-md p-1 text-primary/70 hover:bg-white hover:text-primary"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className={cn(bodyClassName ?? 'flex-1 overflow-y-auto p-4')}>{children}</div>
      </div>
    </div>
  );
}
