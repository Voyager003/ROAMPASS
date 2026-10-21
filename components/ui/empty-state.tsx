import type { ReactNode } from 'react';

/** An empty screen says what to do next, not how it feels. */
export function EmptyState({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-card bg-layer px-6 py-14 text-center">
      <p className="text-[17px] font-bold">{title}</p>
      {description && <p className="mx-auto mt-1.5 max-w-[50ch] text-[15px] text-fg-muted">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
