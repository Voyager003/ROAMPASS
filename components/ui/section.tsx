import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Full-width white block of a mobile screen; blocks are separated by the grey basement, as in the
 * demo video (docs/decisions.md #32).
 */
export function Section({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('bg-layer px-5 py-6', className)}>{children}</section>;
}

/** Section title with the blue left bar and an optional hint on the right ("체류기간 내에서 선택"). */
export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="border-l-[3px] border-brand pl-2 text-[17px] leading-tight font-bold text-fg">{children}</h2>
      {hint && <p className="text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}
