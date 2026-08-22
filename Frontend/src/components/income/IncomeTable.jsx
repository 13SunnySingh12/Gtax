import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/services/currency';

/** Income table with per-row edit/delete. Mobile collapses to stacked cards (§15). */
export function IncomeTable({ incomes, onEdit, onDelete, busyId }) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden sm:block">
        <Table>
          <THead>
            <TR>
              <TH>Source</TH>
              <TH className="text-right">Amount</TH>
              <TH>Date</TH>
              <TH>Notes</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {incomes.map((i) => (
              <TR key={i.id} className="hover:bg-surface">
                <TD className="font-medium">{i.source}</TD>
                <TD className="text-right tabular">{formatCurrency(i.amount)}</TD>
                <TD className="tabular">{formatDate(i.incomeDate)}</TD>
                <TD className="max-w-[16rem] truncate text-text-muted">{i.notes || '—'}</TD>
                <TD>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(i)} aria-label="Edit income">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(i)}
                      aria-label="Delete income"
                      disabled={busyId === i.id}
                    >
                      {busyId === i.id ? (
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

      {/* Mobile stacked cards */}
      <div className="flex flex-col gap-2 sm:hidden">
        {incomes.map((i) => (
          <div key={i.id} className="rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{i.source}</span>
              <span className="tabular font-medium">{formatCurrency(i.amount)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-caption text-text-muted">
              <span>{formatDate(i.incomeDate)}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(i)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(i)} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-error" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
