'use client';

import { useEffect, useState } from 'react';

import { formatRemainingMs } from '@/lib/format/kst';

/**
 * Usage time left. The backend computes `remainingSeconds` at read time; the screen only counts it
 * down locally (backend README §2.6 "판정은 서버가 합니다"). Ticks once a minute, the text's precision.
 */
export function RemainingTime({ remainingSeconds }: { remainingSeconds: number }) {
  const [remainingMs, setRemainingMs] = useState(remainingSeconds * 1000);

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => setRemainingMs(remainingSeconds * 1000 - (Date.now() - startedAt)), 60_000);
    return () => clearInterval(id);
  }, [remainingSeconds]);

  return <>{formatRemainingMs(remainingMs)}</>;
}
