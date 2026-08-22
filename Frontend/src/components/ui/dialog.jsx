import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Accessible modal dialog (aria-modal, Esc to close, focus moved in and restored
 * on close, §17). Controlled via `open` / `onOpenChange`.
 */
export function Dialog({ open, onOpenChange, title, description, children, footer, className }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    // Move focus into the panel.
    const t = setTimeout(() => {
      const first = panelRef.current?.querySelector(
        'input, select, textarea, button, [tabindex]',
      );
      (first || panelRef.current)?.focus();
    }, 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-lg border border-border bg-white shadow-xl',
          className,
        )}
      >
        <div className="flex items-start justify-between p-6 pb-2">
          <div>
            {title && <h2 className="text-heading text-ink">{title}</h2>}
            {description && <p className="mt-1 text-caption text-text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-text-muted hover:bg-sidebar"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 pt-2">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border p-4">{footer}</div>}
      </div>
    </div>
  );
}
