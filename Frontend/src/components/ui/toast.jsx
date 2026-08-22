import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastCtx = createContext(null);
let idSeq = 0;

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const styles = {
  success: 'border-success/30 text-success',
  error: 'border-error/30 text-error',
  info: 'border-border text-primary',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    ({ title, description, variant = 'info', duration = 3500 }) => {
      const id = ++idSeq;
      setToasts((t) => [...t, { id, title, description, variant }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  return (
    <ToastCtx.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.variant] || Info;
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-80 items-start gap-3 rounded-md border bg-white p-3 shadow-lg',
                styles[t.variant],
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <div className="flex-1">
                {t.title && <p className="text-body font-medium text-ink">{t.title}</p>}
                {t.description && <p className="text-caption text-text-muted">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="text-text-muted hover:text-primary"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
