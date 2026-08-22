import { Sparkles, BookText, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/** User bubbles in `primary`; AI bubbles get an `ai-accent` left border + tag (§8.8). */
export function ChatMessageBubble({ message, onRetry, onSuggestionClick, disabled }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-body text-white">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          'max-w-[85%] rounded-lg rounded-bl-sm border-l-2 bg-surface px-3 py-2 text-body',
          message.error ? 'border-error' : 'border-ai-accent',
        )}
      >
        <div className="mb-1 flex items-center gap-1 text-caption font-medium text-ai-accent">
          <Sparkles className="h-3 w-3" /> AI
        </div>

        {message.pending ? (
          <div className="flex items-center gap-2 text-text-muted">
            <span className="h-2 w-16 animate-shimmer rounded bg-ai-accent/30" /> Thinking…
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-ink">{message.text}</p>
        )}

        {message.error && onRetry && (
          <Button variant="ghost" size="sm" className="mt-1 text-error" onClick={onRetry}>
            <RotateCcw className="h-3 w-3" /> Try again
          </Button>
        )}

        {message.sources?.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-caption text-text-muted">Sources - tap one to ask about it</p>
            <div className="flex flex-wrap items-center gap-1">
              {message.sources.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSuggestionClick?.(s)}
                  disabled={disabled || !onSuggestionClick}
                  title={`Ask about "${s}"`}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-0.5 text-caption',
                    'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                    onSuggestionClick && !disabled && 'cursor-pointer hover:bg-sidebar hover:border-primary/30',
                  )}
                >
                  <BookText className="h-3 w-3" /> {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
