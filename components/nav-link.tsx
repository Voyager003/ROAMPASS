'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, Suspense } from 'react';

import { cn } from '@/lib/cn';

type Props = { href: string; exact?: boolean; tone?: 'light' | 'dark'; children: ReactNode };

/**
 * Admin nav link. Client Component only because it needs the current path to mark "you are here"
 * (docs/decisions.md #17).
 *
 * With Cache Components, usePathname() suspends while prerendering a page whose dynamic param is
 * unknown at build time (e.g. /admin/orders/[orderNo]); without a boundary the build fails
 * (node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md, "may require a
 * Suspense boundary"). So the link carries its own boundary: the fallback is the same link without
 * the "current" mark, and the rest of the layout stays prerendered.
 */
export function NavLink(props: Props) {
  return (
    <Suspense fallback={<NavAnchor {...props} active={false} />}>
      <CurrentNavLink {...props} />
    </Suspense>
  );
}

function CurrentNavLink(props: Props) {
  const pathname = usePathname();
  const { href, exact = false } = props;
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return <NavAnchor {...props} active={active} />;
}

function NavAnchor({ href, tone = 'light', children, active }: Props & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-[15px]',
        active ? 'font-bold' : 'font-medium',
        tone === 'light'
          ? active
            ? 'text-fg'
            : 'text-fg-subtle hover:text-fg'
          : active
            ? 'text-fg-inverted'
            : 'text-fg-inverted/60 hover:text-fg-inverted',
      )}
    >
      {children}
    </Link>
  );
}
