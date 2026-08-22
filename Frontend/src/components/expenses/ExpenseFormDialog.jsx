import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EXPENSE_CATEGORIES } from './categories';

const empty = {
  vendor: '',
  amount: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  category: '',
  isDeductible: false,
  deductionReason: '',
};

/**
 * Add/edit an expense. Also used to review an OCR-prefilled expense — the AI
 * suggested category is shown with an `ai-accent` badge until the user confirms.
 */
export function ExpenseFormDialog({ open, onOpenChange, initial, onSubmit, submitting }) {
  const [form, setForm] = useState(empty);
  const [fieldError, setFieldError] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              vendor: initial.vendor || '',
              amount: initial.amount ?? '',
              expenseDate: initial.expenseDate || empty.expenseDate,
              category: initial.category || initial.aiSuggestedCategory || '',
              isDeductible: !!initial.isDeductible,
              deductionReason: initial.deductionReason || '',
            }
          : empty,
      );
      setFieldError({});
    }
  }, [open, initial]);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const aiSuggested = initial?.aiSuggestedCategory && !initial?.category;

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (form.amount === '' || Number(form.amount) < 0) errs.amount = 'Enter a valid amount';
    if (!form.expenseDate) errs.expenseDate = 'Date is required';
    setFieldError(errs);
    if (Object.keys(errs).length) return;
    onSubmit({
      vendor: form.vendor.trim() || null,
      amount: Number(form.amount),
      expenseDate: form.expenseDate,
      category: form.category || null,
      isDeductible: form.isDeductible,
      deductionReason: form.deductionReason.trim() || null,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? 'Edit expense' : 'Add expense'}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form="expense-form" type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial ? 'Save expense' : 'Add expense'}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-caption text-text-muted">
          Record money you spent on your gig work. Amounts are in rupees.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" min="0" step="0.01" value={form.amount}
              onChange={set('amount')} placeholder="e.g. 1250" />
            {fieldError.amount && <p className="mt-1 text-caption text-error">{fieldError.amount}</p>}
          </div>
          <div>
            <Label htmlFor="expenseDate">Date</Label>
            <Input id="expenseDate" type="date" value={form.expenseDate} onChange={set('expenseDate')} />
            {fieldError.expenseDate && <p className="mt-1 text-caption text-error">{fieldError.expenseDate}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="vendor">Vendor</Label>
          <Input id="vendor" value={form.vendor} onChange={set('vendor')}
            placeholder="e.g. Adobe, Shell, Amazon" />
        </div>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Label htmlFor="category" className="mb-0">Category</Label>
            {aiSuggested && (
              <Badge variant="ai">
                <Sparkles className="h-3 w-3" /> AI suggested
              </Badge>
            )}
          </div>
          <Select id="category" value={form.category} onChange={set('category')}>
            <option value="">Select a category…</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="flex items-center gap-2 text-body">
            <input type="checkbox" checked={form.isDeductible} onChange={set('isDeductible')} className="h-4 w-4" />
            Mark as tax-deductible
          </label>
          <p className="mt-1 text-caption text-text-muted">
            Only deductible expenses reduce your estimated tax. Business costs usually
            qualify; personal spending does not.
          </p>
        </div>
        {form.isDeductible && (
          <div>
            <Label htmlFor="deductionReason">Deduction reason (optional)</Label>
            <Input id="deductionReason" value={form.deductionReason} onChange={set('deductionReason')}
              placeholder="e.g. Design software used for client work" />
          </div>
        )}
      </form>
    </Dialog>
  );
}
