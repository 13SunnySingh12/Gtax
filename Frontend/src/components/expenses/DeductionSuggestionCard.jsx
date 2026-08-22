import { Sparkles, Loader2, BookText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Alert } from '@/components/ui/alert';
import { formatCurrency, formatDate } from '@/services/currency';

/**
 * AI Deduction Finder (§10.1). The AI suggests; the user decides — "Mark
 * deductible / Not deductible" persist via PUT /api/expenses/{id}. Always shows
 * the RAG source rule titles; never a bare number.
 */
export function DeductionSuggestionCard({ expense, suggestion, loading, error, onFetch, onMark, marking, onAskAbout }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Context strip so the suggestion is never detached from what it's about */}
      <div className="rounded-md bg-surface p-3 text-caption text-text-muted">
        <span className="font-medium text-primary">{expense.vendor || 'Expense'}</span> ·{' '}
        {formatCurrency(expense.amount)} · {formatDate(expense.expenseDate)}
      </div>

      {!suggestion && !loading && !error && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-caption text-text-muted">
            Ask the AI whether this expense is likely deductible, grounded in tax-rule documents.
          </p>
          <Button variant="ai" size="sm" onClick={onFetch}>
            <Sparkles className="h-4 w-4" /> Get deduction suggestion
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-body text-ai-accent">
          <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
        </div>
      )}

      {error && (
        <Alert variant="error" action={<Button size="sm" variant="secondary" onClick={onFetch}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {suggestion && (
        <Card className="border-ai-accent/40">
          <CardContent className="flex flex-col gap-3 pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-body font-medium text-ink">
                <Sparkles className="h-4 w-4 text-ai-accent" />
                {suggestion.suggestedCategory || 'Suggested deduction'}
              </span>
              {suggestion.likelihood && <Badge variant="ai">{suggestion.likelihood}</Badge>}
            </div>

            {suggestion.deductionAmount != null && (
              <p className="tabular text-body">Suggested amount: {formatCurrency(suggestion.deductionAmount)}</p>
            )}
            {suggestion.reason && <p className="text-caption text-text-muted">{suggestion.reason}</p>}

            {suggestion.sources?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-caption text-text-muted">Sources:</span>
                {suggestion.sources.map((s) => (
                  <Tooltip key={s} label="Ask the AI chat about this rule">
                    <button
                      type="button"
                      onClick={() => onAskAbout?.(s)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-border px-2 py-0.5 text-caption transition-colors hover:border-primary/30 hover:bg-sidebar"
                    >
                      <BookText className="h-3 w-3" /> {s}
                    </button>
                  </Tooltip>
                ))}
              </div>
            )}

            <div className="mt-1 flex gap-2">
              <Button
                size="sm"
                onClick={() => onMark(true, suggestion.reason)}
                disabled={marking}
              >
                {marking && <Loader2 className="h-4 w-4 animate-spin" />} Mark as deductible
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onMark(false, null)} disabled={marking}>
                Not deductible
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
