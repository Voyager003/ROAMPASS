'use client';

import { ActionButton } from '@seed-design/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Re-renders the current page from the server every `intervalSeconds` (router.refresh(): Server
 * Components re-run, client state is kept). The server stops rendering the Poller once the data
 * reaches an end state, which ends the polling.
 *
 * - Paused while the tab is hidden; refreshes once as soon as it is visible again.
 * - After `maxDurationMs` it stops and shows a manual refresh button with `timeoutHint`
 *   (docs/decisions.md #42).
 */
export function Poller({
  intervalSeconds,
  maxDurationMs,
  timeoutHint,
}: {
  intervalSeconds: number;
  maxDurationMs: number;
  timeoutHint: string;
}) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (timedOut) return;
    const startedAt = Date.now();
    let id: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
      if (id !== undefined) clearInterval(id);
      id = undefined;
    };
    const tick = () => {
      router.refresh();
      if (Date.now() - startedAt >= maxDurationMs) {
        stop();
        setTimedOut(true);
      }
    };
    const start = () => {
      if (id === undefined) id = setInterval(tick, intervalSeconds * 1000);
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        tick();
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [router, intervalSeconds, maxDurationMs, timedOut, round]);

  if (!timedOut) return null;
  return (
    <div className="grid gap-3 rounded-card bg-weak px-4 py-4 text-[14px] text-fg">
      <p>{timeoutHint}</p>
      <ActionButton
        type="button"
        variant="neutralWeak"
        onClick={() => {
          setTimedOut(false);
          setRound((r) => r + 1);
          router.refresh();
        }}
      >
        새로고침
      </ActionButton>
    </div>
  );
}
