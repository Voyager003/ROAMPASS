'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

import { cn } from '@/lib/cn';

import { HomeIcon, SimCardIcon } from './icons';

const TABS = [
  { href: '/', label: '홈', Icon: HomeIcon, exact: true },
  { href: '/my/sims', label: '내 SIM', Icon: SimCardIcon, exact: false },
] as const;

/**
 * Bottom tab bar of the user screens (docs/decisions.md #36). A Client Component only because it
 * needs the current path to mark the active tab (docs/decisions.md #17).
 *
 * usePathname() suspends while prerendering a page with a dynamic param unknown at build time
 * (Cache Components; see components/nav-link.tsx). The fallback is the same bar with no active tab.
 */
export function BottomTabBar() {
  return (
    <Suspense fallback={<TabList pathname={null} />}>
      <CurrentTabList />
    </Suspense>
  );
}

function CurrentTabList() {
  return <TabList pathname={usePathname()} />;
}

function TabList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="주 메뉴" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-layer">
      <ul className="mx-auto flex max-w-[480px]">
        {TABS.map(({ href, label, Icon, exact }) => {
          const active =
            pathname !== null && (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 pt-2 pb-[max(env(safe-area-inset-bottom),8px)] text-[11px]',
                  active ? 'font-bold text-fg' : 'text-fg-subtle',
                )}
              >
                <Icon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
