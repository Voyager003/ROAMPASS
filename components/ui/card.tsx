import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

/** White rounded surface on the grey basement background. No border, no shadow. */
export function Card({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('rounded-card bg-layer p-5', className)} {...props} />;
}
