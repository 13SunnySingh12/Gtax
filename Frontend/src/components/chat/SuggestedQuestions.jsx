const SUGGESTIONS = [
  'What counts as a business expense?',
  'Can I deduct my software subscriptions?',
  'Are travel and fuel costs deductible?',
  'When is my next filing deadline?',
];

/** Chips shown above the input when the thread is empty (§8.8). */
export function SuggestedQuestions({ onPick }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-heading text-ink">Ask a basic tax question</p>
      <p className="max-w-sm text-caption text-text-muted">
        Answers are grounded in tax-rule documents. Informational only — not tax advice.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-full border border-border px-3 py-1.5 text-caption text-primary hover:bg-sidebar"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
