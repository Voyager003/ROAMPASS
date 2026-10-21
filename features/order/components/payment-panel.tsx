'use client';

import { ActionButton } from '@seed-design/react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';

import { BottomCta } from '@/components/ui/bottom-cta';
import { Section } from '@/components/ui/section';
import type { Instant, OrderNo } from '@/lib/api/types';
import { cn } from '@/lib/cn';

import { formatCountdown } from '../countdown';
import type { PaymentFormState } from '../payment';

/** Ask the server again this long after the countdown hits zero, so its clock has passed expiresAt too. */
const EXPIRY_GRACE_MS = 1_000;

/**
 * Payment step of a PENDING order: the deadline countdown and the pay button.
 *
 * - The countdown uses the server's "now" (`serverNow`) to cancel out a wrong device clock: the offset
 *   between the two clocks is taken once at mount.
 * - At zero it refreshes the page once; the server then renders the expired screen (the backend judges
 *   expiry itself, so this is only a display trigger).
 * - The pay button posts to a Server Action through useActionState (pending flag + result notice).
 */
export function PaymentPanel({
  orderNo,
  expiresAt,
  serverNow,
  payAction,
}: {
  orderNo: OrderNo;
  expiresAt: Instant;
  serverNow: Instant;
  payAction: (state: PaymentFormState, formData: FormData) => Promise<PaymentFormState>;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(payAction, null);
  const deadline = Date.parse(expiresAt);
  const [remainingMs, setRemainingMs] = useState(() => deadline - Date.parse(serverNow));
  const refreshed = useRef(false);

  useEffect(() => {
    const clockOffset = Date.parse(serverNow) - Date.now();
    const tick = () => {
      const remaining = deadline - (Date.now() + clockOffset);
      setRemainingMs(remaining);
      if (remaining <= -EXPIRY_GRACE_MS && !refreshed.current) {
        refreshed.current = true;
        router.refresh();
      }
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [deadline, serverNow, router]);

  const expired = remainingMs <= 0;
  const confirming = state?.kind === 'confirming';

  return (
    <>
      <Section className="text-center">
        <p className="text-[15px] text-fg-muted">결제 기한</p>
        <p
          className={cn('mt-1 text-[32px] font-bold tabular-nums', expired ? 'text-fg-critical' : 'text-fg-brand')}
          role="timer"
          aria-live="off"
        >
          {formatCountdown(remainingMs)}
        </p>
        <p className="mt-2 text-[13px] text-fg-muted">주문 후 10분 안에 결제하지 않으면 주문이 만료돼요.</p>
      </Section>

      <BottomCta>
        <form action={formAction} className="grid gap-2">
          {state && (
            <p
              role={state.kind === 'error' ? 'alert' : 'status'}
              className={cn('text-center text-[13px]', state.kind === 'error' ? 'text-fg-critical' : 'text-fg')}
            >
              {state.message}
            </p>
          )}
          <input type="hidden" name="orderNo" value={orderNo} />
          <ActionButton type="submit" size="large" disabled={expired || pending || confirming} loading={pending}>
            {confirming ? '결제 확인 중' : '결제하기'}
          </ActionButton>
        </form>
      </BottomCta>
    </>
  );
}
