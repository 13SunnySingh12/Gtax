import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useIncomes } from '@/hooks/useIncomes';
import { incomesApi } from '@/api/incomes';
import { apiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageActions } from '@/components/common/PageActions';
import { SkeletonRows, ErrorBlock, EmptyState } from '@/components/common/States';
import { IncomeTable } from '@/components/income/IncomeTable';
import { IncomeFormDialog } from '@/components/income/IncomeFormDialog';
import { formatCurrency } from '@/services/currency';

export default function Income() {
  const { incomes, loading, error, refetch } = useIncomes();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const total = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (income) => {
    setEditing(income);
    setDialogOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await incomesApi.update(editing.id, payload);
        toast({ variant: 'success', title: 'Income updated' });
      } else {
        await incomesApi.create(payload);
        toast({ variant: 'success', title: 'Income added' });
      }
      setDialogOpen(false);
      refetch();
    } catch (e) {
      toast({ variant: 'error', title: 'Could not save', description: apiErrorMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await incomesApi.remove(toDelete.id);
      toast({ variant: 'success', title: 'Income deleted' });
      setToDelete(null);
      refetch();
    } catch (e) {
      toast({ variant: 'error', title: 'Could not delete', description: apiErrorMessage(e) });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageActions description={incomes.length ? `Total logged: ${formatCurrency(total)}` : ''}>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add income
        </Button>
      </PageActions>

      {loading && <SkeletonRows />}
      {error && !loading && <ErrorBlock message={error} onRetry={refetch} />}
      {!loading && !error && incomes.length === 0 && (
        <EmptyState
          title="No income logged yet"
          description="Add each payment you receive - for example 'Uber India, Rs. 45,000'. Your income drives the tax estimate."
        >
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add income
          </Button>
        </EmptyState>
      )}
      {!loading && !error && incomes.length > 0 && (
        <IncomeTable incomes={incomes} onEdit={openEdit} onDelete={setToDelete} busyId={deleting ? toDelete?.id : null} />
      )}

      <IncomeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete this income?"
        description={toDelete ? `${toDelete.source} — ${formatCurrency(toDelete.amount)}. This can't be undone.` : ''}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
