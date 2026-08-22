import { Loader2 } from 'lucide-react';
import { Dialog } from './dialog';
import { Button } from './button';

/** Reusable delete/confirm dialog (income & expense deletes, §8.3/8.4). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Delete',
  onConfirm,
  loading,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </>
      }
    >
      {/* `description` is rendered by Dialog under the title - no body needed. */}
    </Dialog>
  );
}
