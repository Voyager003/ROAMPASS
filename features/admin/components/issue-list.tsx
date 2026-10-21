import Link from 'next/link';

import { AsOfIndicator } from '@/components/as-of-indicator';
import { IssueTypeBadge } from '@/components/status-badges';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiError } from '@/lib/api/errors';
import type { AdminIssues, AdminOrderSummary, CallbackInfo, IssueType, WithAsOf } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { ISSUE_TYPE_LABELS } from '@/lib/format/labels';

import { CALLBACK_GROUPS, ORDER_GROUPS, type PendingFilter, parsePendingFilter, pendingDescription, pendingHref } from '../pending';
import { listAdminIssues } from '../queries';
import { CallbackTable } from './callback-table';
import { OrderTable } from './order-table';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Body of /admin/issues, "처리 대기" (assignment §2.3-⑤): a group filter with counts, like the order
 * list's filter bar, and one table for the chosen group. "전체" shows the order groups in one table and
 * the notification groups in another (their columns differ), with the group as the first column.
 * Order rows link to the detail page, where the operator acts; notification rows carry no order number.
 */
export async function IssueList({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filter = parsePendingFilter((await searchParams).type);

  let result: WithAsOf<AdminIssues>;
  try {
    result = await listAdminIssues();
  } catch (error) {
    if (error instanceof ApiError) {
      return (
        <p role="alert" className="rounded-card bg-layer px-5 py-6 text-[15px] text-fg-critical">
          처리 대기 목록을 불러오지 못했어요. ({error.code}) {error.problem.detail}
        </p>
      );
    }
    throw error;
  }

  const { asOf, data } = result;
  const orders: Record<(typeof ORDER_GROUPS)[number], AdminOrderSummary[]> = {
    PAID_NOT_ISSUED: data.stuckAfterPayment,
    NEEDS_ATTENTION: data.needsAttention,
  };
  const callbacks: Record<(typeof CALLBACK_GROUPS)[number], CallbackInfo[]> = {
    AMOUNT_MISMATCH: data.amountMismatches,
    SIGNATURE_INVALID: data.signatureFailures,
  };
  const counts: Record<IssueType, number> = {
    PAID_NOT_ISSUED: orders.PAID_NOT_ISSUED.length,
    NEEDS_ATTENTION: orders.NEEDS_ATTENTION.length,
    AMOUNT_MISMATCH: callbacks.AMOUNT_MISMATCH.length,
    SIGNATURE_INVALID: callbacks.SIGNATURE_INVALID.length,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <nav aria-label="처리 대기 묶음" className="mb-4 flex flex-wrap gap-2 rounded-card bg-layer p-4">
        <FilterLink filter="ALL" current={filter} label="전체" count={total} />
        {[...ORDER_GROUPS, ...CALLBACK_GROUPS].map((type) => (
          <FilterLink key={type} filter={type} current={filter} label={ISSUE_TYPE_LABELS[type].label} count={counts[type]} />
        ))}
      </nav>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[70ch] text-[14px] text-fg-muted">
          {filter === 'ALL'
            ? `결제 후 ${data.stuckThresholdMinutes}분 넘게 미발급, 환불 실패, 결제 금액 불일치, 서명 불일치를 모아 봐요. 묶음마다 최대 50건까지 보여요.`
            : pendingDescription(filter, data.stuckThresholdMinutes)}
        </p>
        <AsOfIndicator asOf={asOf} serverNow={new Date().toISOString()} />
      </div>

      <Body filter={filter} orders={orders} callbacks={callbacks} />
    </>
  );
}

function Body({
  filter,
  orders,
  callbacks,
}: {
  filter: PendingFilter;
  orders: Record<(typeof ORDER_GROUPS)[number], AdminOrderSummary[]>;
  callbacks: Record<(typeof CALLBACK_GROUPS)[number], CallbackInfo[]>;
}) {
  if (filter === 'ALL') {
    const orderRows = ORDER_GROUPS.flatMap((type) => orders[type].map((row) => ({ type, row })));
    const callbackRows = CALLBACK_GROUPS.flatMap((type) => callbacks[type].map((row) => ({ type, row })));
    if (orderRows.length === 0 && callbackRows.length === 0) return <Empty />;
    const orderType = new Map(orderRows.map(({ type, row }) => [row, type]));
    const callbackType = new Map(callbackRows.map(({ type, row }) => [row, type]));
    return (
      <div className="space-y-6">
        {orderRows.length > 0 && (
          <OrderTable
            orders={orderRows.map((r) => r.row)}
            leading={{ header: '구분', cell: (row) => <IssueTypeBadge type={orderType.get(row) as IssueType} /> }}
          />
        )}
        {callbackRows.length > 0 && (
          <CallbackTable
            callbacks={callbackRows.map((r) => r.row)}
            leading={{ header: '구분', cell: (row) => <IssueTypeBadge type={callbackType.get(row) as IssueType} /> }}
          />
        )}
      </div>
    );
  }
  if (filter === 'PAID_NOT_ISSUED' || filter === 'NEEDS_ATTENTION') {
    return orders[filter].length === 0 ? <Empty /> : <OrderTable orders={orders[filter]} />;
  }
  return callbacks[filter].length === 0 ? <Empty /> : <CallbackTable callbacks={callbacks[filter]} />;
}

function FilterLink({ filter, current, label, count }: { filter: PendingFilter; current: PendingFilter; label: string; count: number }) {
  const active = filter === current;
  return (
    <Link
      href={pendingHref(filter)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[14px]',
        active ? 'border-brand bg-brand font-bold text-fg-inverted' : 'border-line bg-layer text-fg hover:bg-weak',
      )}
    >
      {label}
      <span className={cn('tabular-nums', active ? 'text-fg-inverted' : count > 0 ? 'font-bold text-fg-critical' : 'text-fg-subtle')}>
        {count}
      </span>
    </Link>
  );
}

function Empty() {
  return <EmptyState title="처리할 건이 없어요" description="자동 처리가 모두 정상으로 끝났어요." />;
}

export function IssueListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-16 animate-pulse rounded-card bg-layer" />
      <div className="h-80 animate-pulse rounded-card bg-layer" />
    </div>
  );
}
