import { createContext, useContext, useId, useState } from 'react';
import { cn } from '@/lib/utils';

const TabsCtx = createContext(null);

export function Tabs({ value, defaultValue, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = (v) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsCtx.Provider value={{ active, setActive, baseId: useId() }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, ...props }) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex gap-1 rounded-md bg-surface p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ value, className, children }) {
  const { active, setActive, baseId } = useContext(TabsCtx);
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-${value}-tab`}
      aria-selected={selected}
      aria-controls={`${baseId}-${value}-panel`}
      onClick={() => setActive(value)}
      className={cn(
        'rounded-md px-3 py-1.5 text-caption font-medium transition-colors',
        selected ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-primary',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const { active, baseId } = useContext(TabsCtx);
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-${value}-panel`}
      aria-labelledby={`${baseId}-${value}-tab`}
      className={cn('mt-4', className)}
    >
      {children}
    </div>
  );
}
