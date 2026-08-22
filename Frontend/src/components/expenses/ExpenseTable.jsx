import { Sparkles, ImageIcon, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/services/currency';

/** Expense table. Clicking a row opens the detail sheet (§8.4). */
export function ExpenseTable({ expenses, onOpen, onDelete, busyId }) {
  const CategoryCell = ({ e }) => {
    if (e.category) return <span>{e.category}</span>;
    if (e.aiSuggestedCategory) {
      return (
        <Badge variant="ai">
          <Sparkles className="h-3 w-3" /> {e.aiSuggestedCategory}
        </Badge>
      );
    }
    return <span className="text-text-muted">&mdash;</span>;
  };

  // Keep the row click from firing when the delete button is pressed.
  const deleteClick = (e, expense) => {
    e.stopPropagation();
    onDelete(expense);
  };

  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <THead>
            <TR>
              <TH>Vendor</TH>
              <TH className="text-right">Amount</TH>
              <TH>Date</TH>
              <TH>Category</TH>
              <TH>Deductible</TH>
              <TH>Receipt</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {expenses.map((e) => (
              <TR
                key={e.id}
                className="cursor-pointer hover:bg-surface"
                onClick={() => onOpen(e)}
                tabIndex={0}
                onKeyDown={(ev) => (ev.key === 'Enter' ? onOpen(e) : null)}
              >
                <TD className="font-medium">{e.vendor || '—'}</TD>
                <TD className="text-right tabular">{formatCurrency(e.amount)}</TD>
                <TD className="tabular">{formatDate(e.expenseDate)}</TD>
                <TD><CategoryCell e={e} /></TD>
                <TD>
                  {e.isDeductible ? (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3" /> Deductible
                    </Badge>
                  ) : (
                    <span className="text-text-muted">No</span>
                  )}
                </TD>
                <TD>{e.receipt ? <ImageIcon className="h-4 w-4 text-text-muted" aria-label="Has receipt" /> : '—'}</TD>
                <TD>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete expense ${e.vendor || ''}`.trim()}
                      disabled={busyId === e.id}
                      onClick={(ev) => deleteClick(ev, e)}
                    >
                      {busyId === e.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-error" />
                      )}
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {/* Mobile stacked cards. A div (not a button) so the delete control can
          live inside without nesting interactive elements. */}
      <div className="flex flex-col gap-2 sm:hidden">
        {expenses.map((e) => (
          <div
            key={e.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(e)}
            onKeyDown={(ev) => (ev.key === 'Enter' ? onOpen(e) : null)}
            className="cursor-pointer rounded-md border border-border p-3 text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{e.vendor || 'Expense'}</span>
              <div className="flex items-center gap-2">
                <span className="tabular font-medium">{formatCurrency(e.amount)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete expense ${e.vendor || ''}`.trim()}
                  disabled={busyId === e.id}
                  onClick={(ev) => deleteClick(ev, e)}
                >
                  {busyId === e.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-error" />
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-caption text-text-muted">
              <span>{formatDate(e.expenseDate)}</span>
              <CategoryCell e={e} />
              {e.isDeductible && <Badge variant="success">Deductible</Badge>}
              {e.receipt && <ImageIcon className="h-4 w-4" />}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
