import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const empty = { source: '', amount: '', incomeDate: new Date().toISOString().slice(0, 10), notes: '' };

export function IncomeFormDialog({ open, onOpenChange, initial, onSubmit, submitting }) {
  const [form, setForm] = useState(empty);
  const [fieldError, setFieldError] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              source: initial.source || '',
              amount: initial.amount ?? '',
              incomeDate: initial.incomeDate || empty.incomeDate,
              notes: initial.notes || '',
            }
          : empty,
      );
      setFieldError({});
    }
  }, [open, initial]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.source.trim()) errs.source = 'Source is required';
    if (form.amount === '' || Number(form.amount) < 0) errs.amount = 'Enter a valid amount';
    if (!form.incomeDate) errs.incomeDate = 'Date is required';
    setFieldError(errs);
    if (Object.keys(errs).length) return;
    onSubmit({
      source: form.source.trim(),
      amount: Number(form.amount),
      incomeDate: form.incomeDate,
      notes: form.notes.trim() || null,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? 'Edit income' : 'Add income'}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form="income-form" type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial ? 'Save changes' : 'Add income'}
          </Button>
        </>
      }
    >
      <form id="income-form" onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-caption text-text-muted">
          Record a payment you received. Amounts are in rupees.
        </p>
        <div>
          <Label htmlFor="source">Source</Label>
          <Input id="source" value={form.source} onChange={set('source')}
            placeholder="e.g. Uber India, Swiggy, Upwork client" />
          {fieldError.source && <p className="mt-1 text-caption text-error">{fieldError.source}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" min="0" step="0.01" value={form.amount}
              onChange={set('amount')} placeholder="e.g. 45000" />
            {fieldError.amount && <p className="mt-1 text-caption text-error">{fieldError.amount}</p>}
          </div>
          <div>
            <Label htmlFor="incomeDate">Date</Label>
            <Input id="incomeDate" type="date" value={form.incomeDate} onChange={set('incomeDate')} />
            {fieldError.incomeDate && <p className="mt-1 text-caption text-error">{fieldError.incomeDate}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input id="notes" value={form.notes} onChange={set('notes')}
            placeholder="e.g. Payout for June deliveries" />
        </div>
      </form>
    </Dialog>
  );
}
