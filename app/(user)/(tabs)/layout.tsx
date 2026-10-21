import Link from 'next/link';
import { Suspense } from 'react';

import { IdentityChip } from '@/components/identity-chip';
import { BottomTabBar } from '@/components/shell/bottom-tab-bar';

/** Home and My SIMs: brand top bar with the demo identity chip, and the bottom tab bar. */
export default function TabsLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-layer">
        <div className="flex h-14 items-center px-5">
          <Link href="/" className="text-[19px] font-extrabold tracking-tight text-fg-brand">
            ROAMPASS
          </Link>
          <div className="ml-auto">
            <Suspense fallback={null}>
              <IdentityChip role="user" />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="pb-24">{children}</main>
      <BottomTabBar />
    </>
  );
}
