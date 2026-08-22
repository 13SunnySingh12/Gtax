import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Simple hover/focus tooltip (rule citations, §6). Content shown on demand. */
export function Tooltip({ label, children, className }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap',
            'rounded-md bg-primary px-2 py-1 text-caption text-white shadow-md',
            className,
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
