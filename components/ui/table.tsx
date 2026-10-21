import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

/**
 * Dense data table for admin screens. SEED has no table component (it targets mobile apps),
 * so this one stays ours, styled with SEED tokens. Scrolls horizontally instead of the page.
 */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto rounded-card bg-layer">
      <table className={cn('w-full border-collapse text-sm tabular-nums', className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn('border-b border-line px-4 py-2.5 text-left text-xs font-medium whitespace-nowrap text-fg-muted', className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('border-b border-line px-4 py-3 align-middle whitespace-nowrap', className)} {...props} />;
}
