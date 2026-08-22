import { useRef, useState, useEffect } from 'react';
import { UploadCloud, FileImage } from 'lucide-react';
import { expensesApi } from '@/api/expenses';
import { apiErrorMessage } from '@/api/client';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/services/image';

const PROCESSING_LABELS = ['Reading your receipt…', 'Suggesting a category…'];

/**
 * Drag-and-drop / picker upload that drives the OCR flow (§9). The frontend
 * never sees FastAPI — Spring Boot orchestrates OCR + categorization inside the
 * single upload-receipt call, so we show upload progress then a shimmer stage.
 */
export function ReceiptUploadZone({ onUploaded }) {
  const inputRef = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle | preparing | uploading | processing | failed
  const [progress, setProgress] = useState(0);
  const [labelIdx, setLabelIdx] = useState(0);
  const [error, setError] = useState(null);
  const [lastFile, setLastFile] = useState(null);

  useEffect(() => {
    if (phase !== 'processing') return undefined;
    const t = setInterval(() => setLabelIdx((i) => (i + 1) % PROCESSING_LABELS.length), 1800);
    return () => clearInterval(t);
  }, [phase]);

  const startUpload = async (file) => {
    // Ignore anything that arrives while a scan is already running, so the same
    // receipt can never be submitted twice by a double click or a second drop.
    if (!file || (phase !== 'idle' && phase !== 'failed')) return;
    setLastFile(file);
    setError(null);
    setProgress(0);
    setPhase('preparing');
    try {
      // Shrink large photos locally first - this is the single biggest saving in
      // the OCR round trip.
      const payload = await compressImage(file);
      setPhase('uploading');
      const expense = await expensesApi.uploadReceipt(payload, (evt) => {
        if (evt.total) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setProgress(pct);
          if (pct >= 100) setPhase('processing');
        }
      });
      setPhase('idle');
      onUploaded(expense); // open the review form pre-filled from OCR
    } catch (e) {
      setError(apiErrorMessage(e, "We couldn't read this receipt automatically."));
      setPhase('failed');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) startUpload(file);
  };

  if (phase === 'preparing' || phase === 'uploading' || phase === 'processing') {
    return (
      <div className="rounded-lg border border-border p-4">
        <div className="mb-2 flex items-center gap-2 text-body text-primary">
          <FileImage className="h-5 w-5 text-ai-accent" />
          {phase === 'preparing'
            ? 'Preparing image…'
            : phase === 'uploading'
              ? 'Uploading receipt…'
              : PROCESSING_LABELS[labelIdx]}
        </div>
        {phase === 'uploading' ? (
          <Progress value={progress} />
        ) : (
          <Skeleton className="h-10 w-full" />
        )}
      </div>
    );
  }

  if (phase === 'failed') {
    return (
      <Alert
        variant="error"
        title="Couldn't read the receipt"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => startUpload(lastFile)}>
              Try scanning again
            </Button>
          </div>
        }
      >
        {error} You can fill it in manually with “Add expense”.
      </Alert>
    );
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/50 p-6 text-center"
    >
      <UploadCloud className="h-6 w-6 text-text-muted" />
      <p className="text-body text-primary">Drag &amp; drop a receipt, or</p>
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
        Choose file
      </Button>
      <p className="max-w-sm text-caption text-text-muted">
        Upload a clear photo or PDF of your receipt and we&apos;ll read the{' '}
        <b>amount, date and vendor</b> automatically, then suggest a category.
        You can edit anything before saving.
      </p>
      <p className="text-caption text-text-muted">Images or PDF, up to 15 MB.</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = ''; // allow re-selecting the same file after a failure
          startUpload(f);
        }}
      />
    </div>
  );
}
