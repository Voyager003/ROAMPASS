import type { ReactNode } from 'react';

import { AsOfIndicator } from '@/components/as-of-indicator';
import { IssueTypeBadge } from '@/components/status-badges';
import { ApiError } from '@/lib/api/errors';
import type { AdminIssues, IssueType, WithAsOf } from '@/lib/api/types';

import { listAdminIssues } from '../queries';
import { CallbackTable } from './callback-table';
import { OrderTable } from './order-table';

/**
 * Body of /admin/issues (assignment §2.3-⑤): orders paid but not issued after the backend's threshold,
 * orders automatic recovery gave up on, and recent PG notifications with a wrong amount or signature.
 * Each group shows at most the backend's limit (50); order rows link to the detail page, where the
 * operator acts. Callback rows carry no order number in the backend response, so they are not linked.
 */
export async function IssueList() {
  let result: WithAsOf<AdminIssues>;
  try {
    result = await listAdminIssues();
  } catch (error) {
    if (error instanceof ApiError) {
      return (
        <p role="alert" className="rounded-card bg-layer px-5 py-6 text-[15px] text-fg-critical">
          이상 건을 불러오지 못했어요. ({error.code}) {error.problem.detail}
        </p>
      );
    }
    throw error;
  }

  const { asOf, data } = result;
  const total =
    data.stuckAfterPayment.length + data.needsAttention.length + data.amountMismatches.length + data.signatureFailures.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-fg">
          총 <strong className="tabular-nums">{total}</strong>건
        </p>
        <AsOfIndicator asOf={asOf} serverNow={new Date().toISOString()} />
      </div>

      <Group
        type="PAID_NOT_ISSUED"
        count={data.stuckAfterPayment.length}
        description={`결제 승인 후 ${data.stuckThresholdMinutes}분이 지나도록 발급되지 않은 주문(결제 완료·발급 중)이에요.`}
      >
        <OrderTable orders={data.stuckAfterPayment} />
      </Group>

      <Group
        type="NEEDS_ATTENTION"
        count={data.needsAttention.length}
        description="자동 처리(환불 재시도 등)를 포기해 운영자 조치가 필요한 주문이에요. 상세에서 수동 환불이나 발급 재시도를 할 수 있어요."
      >
        <OrderTable orders={data.needsAttention} />
      </Group>

      <Group
        type="AMOUNT_MISMATCH"
        count={data.amountMismatches.length}
        description="결제 금액이 주문과 다른 PG 통지예요(최근). 결제를 확정하지 않고 승인 대기로 남겨 두었어요."
      >
        <CallbackTable callbacks={data.amountMismatches} />
      </Group>

      <Group
        type="SIGNATURE_INVALID"
        count={data.signatureFailures.length}
        description="서명이 맞지 않아 거부한 통지예요(최근). 위조되었거나 키가 어긋났을 수 있어요."
      >
        <CallbackTable callbacks={data.signatureFailures} />
      </Group>
    </div>
  );
}

function Group({
  type,
  count,
  description,
  children,
}: {
  type: IssueType;
  count: number;
  description: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <IssueTypeBadge type={type} />
        <span className="text-[14px] font-bold tabular-nums text-fg">{count}건</span>
      </div>
      <p className="mb-3 text-[14px] text-fg-muted">{description}</p>
      {count === 0 ? (
        <p className="rounded-card bg-layer px-4 py-3 text-[14px] text-fg-muted">해당하는 건이 없어요.</p>
      ) : (
        children
      )}
    </section>
  );
}

export function IssueListSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-48 animate-pulse rounded-card bg-layer" />
      <div className="h-48 animate-pulse rounded-card bg-layer" />
    </div>
  );
}
