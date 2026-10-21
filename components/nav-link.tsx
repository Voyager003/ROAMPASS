'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/** Admin nav link. Client Component only because it needs the current path to mark "you are here" (docs/decisions.md #17). */
export function NavLink({ href, exact = false, tone = 'light', children }: { href: string; exact?: boolean; tone?: 'light' | 'dark'; children: ReactNode }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-[15px]',
        active ? 'font-bold' : 'font-medium',
        tone === 'light' ? (active ? 'text-fg' : 'text-fg-subtle hover:text-fg') : active ? 'text-fg-inverted' : 'text-fg-inverted/60 hover:text-fg-inverted',
      )}
    >
      {children}
    </Link>
  );
}
