import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { expensesApi } from '@/api/expenses';
import { apiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageActions } from '@/components/common/PageActions';
import { SkeletonRows, ErrorBlock, EmptyState } from '@/components/common/States';
import { ExpenseTable } from '@/components/expenses/ExpenseTable';
import { ExpenseFormDialog } from '@/components/expenses/ExpenseFormDialog';
import { ReceiptUploadZone } from '@/components/expenses/ReceiptUploadZone';
import { ReceiptDetailSheet } from '@/components/expenses/ReceiptDetailSheet';
import { formatCurrency } from '@/services/currency';

export default function Expenses() {
  const { expenses, loading, error, refetch } = useExpenses();
  const { toast } = useToast();

  const [showUpload, setShowUpload] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await expensesApi.update(editing.id, payload);
        toast({ variant: 'success', title: 'Expense saved' });
      } else {
        await expensesApi.create(payload);
        toast({ variant: 'success', title: 'Expense added' });
      }
      setFormOpen(false);
      setDetail(null);
      refetch();
    } catch (e) {
      toast({ variant: 'error', title: 'Could not save', description: apiErrorMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete || deleting) return; // guard against a double confirm click
    setDeleting(true);
    try {
      await expensesApi.remove(toDelete.id);
      toast({ variant: 'success', title: 'Expense deleted' });
      setToDelete(null);
      setDetail(null);
      refetch();
    } catch (e) {
      toast({ variant: 'error', title: 'Could not delete', description: apiErrorMessage(e) });
    } finally {
      setDeleting(false);
    }
  };

  // A receipt upload returns an enriched expense; open it for review immediately.
  const handleUploaded = (expense) => {
    setShowUpload(false);
    refetch();
    setEditing(expense);
    setFormOpen(true);
    toast({ variant: 'success', title: 'Receipt read', description: 'Review the pre-filled details.' });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageActions description={expenses.length ? `${expenses.length} expense(s)` : ''}>
        <Button variant="secondary" onClick={() => setShowUpload((v) => !v)}>
          Upload receipt
        </Button>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add expense
        </Button>
      </PageActions>

      {showUpload && <ReceiptUploadZone onUploaded={handleUploaded} />}

      {loading && <SkeletonRows />}
      {error && !loading && <ErrorBlock message={error} onRetry={refetch} />}
      {!loading && !error && expenses.length === 0 && (
        <EmptyState
          title="No expenses yet"
          description="Add a work expense such as fuel or a software subscription, or upload a receipt and we'll read the details for you. Deductible expenses lower your tax."
        >
          <Button variant="secondary" onClick={() => setShowUpload(true)}>
            Upload receipt
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add expense
          </Button>
        </EmptyState>
      )}
      {!loading && !error && expenses.length > 0 && (
        <ExpenseTable
          expenses={expenses}
          onOpen={setDetail}
          onDelete={setToDelete}
          busyId={deleting ? toDelete?.id : null}
        />
      )}

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
      <ReceiptDetailSheet
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
        expense={detail}
        onEdit={(e) => {
          setDetail(null);
          setEditing(e);
          setFormOpen(true);
        }}
        onUpdated={refetch}
        onDelete={setToDelete}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete this expense?"
        description={
          toDelete
            ? `${toDelete.vendor || 'Expense'} - ${formatCurrency(toDelete.amount)}. ` +
              `${toDelete.receipt ? 'Its receipt will be removed too. ' : ''}This can't be undone.`
            : ''
        }
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
