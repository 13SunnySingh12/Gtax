import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge only knows its built-in font-size names, so custom tokens like
 * `text-label` would be misread as TEXT COLORS and silently dropped whenever a
 * real color class (e.g. `text-primary`) appeared in the same call. Registering
 * them in the `font-size` group keeps size and color independent.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['stat', 'display', 'heading', 'subheading', 'body', 'label', 'caption'] },
      ],
    },
  },
});

/** Merge conditional class names with Tailwind conflict resolution. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
