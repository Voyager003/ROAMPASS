'use client';

import { ActionButton } from '@seed-design/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import type { Instant } from '@/lib/api/types';
import { formatAge, formatKstDateTime } from '@/lib/format/kst';

/**
 * "N초 전 데이터" for admin screens (docs/decisions.md #7): the backend stamps each admin response with
 * `asOf`; this shows how old it is, ticking every second, plus a refresh button that re-renders the
 * page from the server (router.refresh(), filters and scroll kept).
 * The first render uses `serverNow` so server and browser render the same text.
 */
export function AsOfIndicator({ asOf, serverNow }: { asOf: Instant; serverNow: Instant }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [now, setNow] = useState(() => new Date(serverNow));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 text-[13px] text-fg-muted">
      <span title={`조회 시각 ${formatKstDateTime(asOf)} (KST)`}>{formatAge(asOf, now)} 데이터</span>
      <ActionButton
        type="button"
        size="small"
        variant="neutralWeak"
        loading={pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        새로고침
      </ActionButton>
    </div>
  );
}
