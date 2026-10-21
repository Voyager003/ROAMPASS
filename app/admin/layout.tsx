import Link from 'next/link';
import { Suspense } from 'react';

import { IdentityChip } from '@/components/identity-chip';
import { NavLink } from '@/components/nav-link';

/** Operator screens: full width and dense; the inverted bar makes it obvious you are in the admin (docs/decisions.md #36). */
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <>
      <header className="bg-inverted">
        <div className="flex h-12 items-center gap-6 px-6">
          <Link href="/admin" className="text-[15px] font-bold text-fg-inverted">
            ROAMPASS 운영
          </Link>
          <nav className="flex gap-5" aria-label="운영 메뉴">
            <NavLink href="/admin/orders" tone="dark">
              주문
            </NavLink>
            <NavLink href="/admin/issues" tone="dark">
              이상 건
            </NavLink>
          </nav>
          <div className="ml-auto">
            <Suspense fallback={null}>
              <IdentityChip role="admin" tone="dark" />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="px-6 py-6">{children}</main>
    </>
  );
}
