import Link from 'next/link';
import type { ReactNode } from 'react';

import { Poller } from '@/components/poller';
import { Section, SectionTitle } from '@/components/ui/section';
import type { IssuanceWaiting, MySimDetail } from '@/lib/api/types';
import { formatKstDateTime } from '@/lib/format/kst';
import { WAITING_ACTION_LABELS, WAITING_STAGE_LABELS } from '@/lib/format/labels';

import { refundOrderAction } from '../actions';
import { DEFAULT_POLL_INTERVAL_SECONDS, isMoving, POLL_MAX_DURATION_MS, resultCopyOf } from '../progress';
import { RefundButton } from './refund-button';

const POLL_TIMEOUT_HINT =
  '결과를 확인하는 데 시간이 오래 걸리고 있어요. 창을 닫아도 처리는 계속돼요. 새로고침하거나 나중에 내 SIM에서 확인하세요.';

/**
 * Order page after payment (F1-5): the eSIM issuance-waiting step, or the result of the order
 * (issued, failed/refund, operator check, USIM pickup). While the server is still moving the order
 * (progress.ts `isMoving`) a <Poller> re-renders the page; it disappears at an end state.
 */
export function OrderProgress({ detail }: { detail: MySimDetail }) {
  const poller = isMoving(detail.orderStatus) && (
    <Poller
      intervalSeconds={detail.waiting?.pollIntervalSeconds ?? DEFAULT_POLL_INTERVAL_SECONDS}
      maxDurationMs={POLL_MAX_DURATION_MS}
      timeoutHint={POLL_TIMEOUT_HINT}
    />
  );

  if (detail.waiting) {
    return <WaitingSection orderNo={detail.orderNo} waiting={detail.waiting} poller={poller} />;
  }

  const copy = resultCopyOf(detail.orderStatus);
  return (
    <Section className="space-y-4 text-center">
      {copy && (
        <div>
          <p className="text-[19px] font-bold text-fg">{copy.title}</p>
          <p className="mt-2 text-[14px] text-fg-muted">{copy.description}</p>
        </div>
      )}
      {poller}
      <MySimLink orderNo={detail.orderNo} />
    </Section>
  );
}

function WaitingSection({
  orderNo,
  waiting,
  poller,
}: {
  orderNo: string;
  waiting: IssuanceWaiting;
  poller: ReactNode;
}) {
  const stage = WAITING_STAGE_LABELS[waiting.stage];
  return (
    <>
      <Section className="space-y-3 text-center">
        <span aria-hidden className="mx-auto block size-3 animate-ping rounded-full bg-brand" />
        <p className="text-[19px] font-bold text-fg" role="status">
          {stage.title}
        </p>
        <p className="text-[14px] text-fg-muted">{stage.description}</p>
        {waiting.resultDeadline && !waiting.overdue && (
          <p className="text-[13px] text-fg-muted">
            {formatKstDateTime(waiting.resultDeadline)}까지 결과가 없으면 발급을 중단하고 자동으로 환불해요.
          </p>
        )}
        {waiting.overdue && (
          <p className="text-[13px] text-fg-critical">결과 기한이 지났어요. 곧 발급을 중단하고 자동으로 환불해요.</p>
        )}
        {poller}
      </Section>

      <Section>
        <SectionTitle>발급이 늦을 때 할 수 있는 일</SectionTitle>
        <ul className="space-y-3 text-[14px] text-fg">
          {waiting.actions.map((action) => (
            <li key={action}>
              {action === 'REQUEST_REFUND' ? (
                <div className="grid gap-2">
                  <p className="text-fg-muted">공급사에 발급을 요청하기 전이라 지금은 환불할 수 있어요.</p>
                  <RefundButton orderNo={orderNo} refundAction={refundOrderAction} />
                </div>
              ) : (
                <p>· {WAITING_ACTION_LABELS[action]}</p>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <MySimLink orderNo={orderNo} />
        </div>
      </Section>
    </>
  );
}

function MySimLink({ orderNo }: { orderNo: string }) {
  return (
    <Link href={`/my/sims/${encodeURIComponent(orderNo)}`} className="text-[14px] font-bold text-fg-brand underline">
      내 SIM에서 보기
    </Link>
  );
}
