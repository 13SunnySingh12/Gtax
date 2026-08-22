import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { expensesApi } from '@/api/expenses';
import { apiErrorMessage } from '@/api/client';
import { useToast } from '@/components/ui/toast';
import { useDeductionSuggestions } from '@/hooks/useDeductionSuggestions';
import { formatCurrency, formatDate } from '@/services/currency';
import { DeductionSuggestionCard } from './DeductionSuggestionCard';

/** Expense detail drawer: Details / Receipt / Deductions tabs (§8.4). */
export function ReceiptDetailSheet({ open, onOpenChange, expense, onEdit, onUpdated, onDelete }) {
  const { suggestion, loading, error, fetchFor, reset } = useDeductionSuggestions();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  if (!expense) return null;

  const markDeductible = async (isDeductible, reason) => {
    try {
      await expensesApi.update(expense.id, {
        amount: Number(expense.amount),
        vendor: expense.vendor,
        expenseDate: expense.expenseDate,
        category: expense.category || expense.aiSuggestedCategory || null,
        isDeductible,
        deductionReason: reason,
      });
      toast({ variant: 'success', title: isDeductible ? 'Marked deductible' : 'Marked not deductible' });
      onUpdated?.();
      onOpenChange(false);
    } catch (e) {
      toast({ variant: 'error', title: 'Could not update', description: apiErrorMessage(e) });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={expense.vendor || 'Expense'}>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="receipt">Receipt</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <dl className="flex flex-col gap-3">
            <Row label="Amount" value={formatCurrency(expense.amount, true)} />
            <Row label="Vendor" value={expense.vendor || '—'} />
            <Row label="Date" value={formatDate(expense.expenseDate)} />
            <Row
              label="Category"
              value={
                expense.category ? (
                  expense.category
                ) : expense.aiSuggestedCategory ? (
                  <Badge variant="ai">AI: {expense.aiSuggestedCategory}</Badge>
                ) : (
                  '—'
                )
              }
            />
            <Row
              label="Deductible"
              value={
                expense.isDeductible ? <Badge variant="success">Yes</Badge> : <span>No</span>
              }
            />
            {expense.deductionReason && <Row label="Reason" value={expense.deductionReason} />}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(expense)}>
              <Pencil className="h-4 w-4" /> Edit details
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete?.(expense)}>
              <Trash2 className="h-4 w-4" /> Delete expense
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="receipt">
          {expense.receipt ? (
            <div className="flex flex-col gap-3">
              <img
                src={expense.receipt.fileUrl}
                alt="Uploaded receipt"
                className="max-h-80 w-full rounded-md border border-border object-contain"
              />
              <div>
                <p className="mb-1 text-caption font-medium uppercase text-text-muted">OCR status</p>
                <Badge variant={expense.receipt.ocrStatus === 'done' ? 'success' : 'warning'}>
                  {expense.receipt.ocrStatus}
                </Badge>
              </div>
              {expense.receipt.ocrRawText && (
                <div>
                  <p className="mb-1 text-caption font-medium uppercase text-text-muted">Raw text</p>
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-surface p-3 text-caption">
                    {expense.receipt.ocrRawText}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <Alert variant="info">No receipt attached to this expense.</Alert>
          )}
        </TabsContent>

        <TabsContent value="deductions">
          <DeductionSuggestionCard
            expense={expense}
            suggestion={suggestion}
            loading={loading}
            error={error}
            onFetch={() => fetchFor(expense.id)}
            onMark={markDeductible}
            onAskAbout={(rule) => {
              // Reuse the existing chat flow - the question is sent there, once.
              onOpenChange(false);
              navigate('/chat', { state: { question: rule } });
            }}
          />
        </TabsContent>
      </Tabs>
    </Sheet>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <dt className="text-caption uppercase text-text-muted">{label}</dt>
      <dd className="text-body text-ink">{value}</dd>
    </div>
  );
}
