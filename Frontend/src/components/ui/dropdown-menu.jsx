import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Minimal click-to-open dropdown. `trigger` is a render function receiving
 * onClick; children are the menu items (use DropdownItem).
 */
export function DropdownMenu({ trigger, children, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {trigger({ onClick: () => setOpen((v) => !v), 'aria-expanded': open, 'aria-haspopup': 'menu' })}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-44 rounded-md border border-border bg-white p-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ className, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-body text-primary hover:bg-sidebar',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
