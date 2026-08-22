import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Accessible checkbox matching the design system (shadcn-style API:
 * `checked` + `onCheckedChange`). Built on a button with role="checkbox" so it
 * needs no extra dependency.
 */
export function Checkbox({ id, checked = false, onCheckedChange, className, ...props }) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors',
        checked ? 'border-primary bg-primary text-white' : 'border-border bg-white',
        className,
      )}
      {...props}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  );
}
