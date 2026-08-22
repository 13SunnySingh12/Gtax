import Loader from '@/components/ui/loader';

/**
 * The one full-screen loading state for the whole app. It is shown only while
 * something is genuinely loading for the first time - never because a tab lost
 * or regained focus.
 */
export function LoadingScreen({ message = 'Loading' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
      {/* The loader positions itself absolutely, so give it a sized stage. */}
      <div className="relative h-40 w-full max-w-md overflow-hidden">
        <Loader />
      </div>
      <p className="text-body text-text-muted" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
