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
              처리 대기
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Suspense fallback={null}>
              <IdentityChip role="admin" tone="dark" />
            </Suspense>
            {/* Demo only: lets a reviewer move between the two sides (docs/decisions.md #45). */}
            <Link href="/" className="text-xs text-fg-inverted/80 underline underline-offset-2 hover:text-fg-inverted">
              사용자 화면
            </Link>
          </div>
        </div>
      </header>
      <main className="px-6 py-6">{children}</main>
    </>
  );
}
