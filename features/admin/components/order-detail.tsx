import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { AsOfIndicator } from '@/components/as-of-indicator';
import {
  InstallStatusBadge,
  OrderStatusBadge,
  PaymentStatusBadge,
  RefundStatusBadge,
} from '@/components/status-badges';
import { Badge } from '@/components/ui/badge';
import { Table, Td, Th } from '@/components/ui/table';
import { ApiError } from '@/lib/api/errors';
import type { AdminOrderDetail, Instant, TimelineEntry, WithAsOf } from '@/lib/api/types';
import { formatKstDateTime, formatKstLocalDateTime, formatLocalDate } from '@/lib/format/kst';
import {
  formatActor,
  formatHistoryStatus,
  formatUsageDays,
  HISTORY_TARGET_LABELS,
  ISSUANCE_STATUS_LABELS,
  SIM_TYPE_LABELS,
} from '@/lib/format/labels';
import { formatMoney } from '@/lib/format/money';

import { manualRefundAvailability, reissueAvailability } from '../action-policy';
import { manualRefundAction, reissueAction } from '../actions';
import { getAdminOrder } from '../queries';
import { CallbackTable } from './callback-table';
import { OperatorActions } from './operator-actions';

/**
 * Body of /admin/orders/[orderNo] (assignment §2.3-⑤): order, operator actions, the status history as
 * one-line timeline entries (when · what · who / which signal · why), then the raw records behind
 * it (payment attempts, issuance requests, SIM profile, refund requests, received callbacks).
 * Statuses are the stored values (no read-time judgement), as the backend sends them.
 */
export async function OrderDetail({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;

  let result: WithAsOf<AdminOrderDetail> | null;
  try {
    result = await getAdminOrder(orderNo);
  } catch (error) {
    if (error instanceof ApiError) {
      return (
        <p role="alert" className="rounded-card bg-layer px-5 py-6 text-[15px] text-fg-critical">
          주문을 불러오지 못했어요. ({error.code}) {error.problem.detail}
        </p>
      );
    }
    throw error;
  }
  if (!result) notFound();

  const { asOf, data } = result;
  const { order, payments, issuanceRequests, profile, refunds, timeline, callbacks } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-bold tabular-nums">{order.orderNo}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <AsOfIndicator asOf={asOf} serverNow={new Date().toISOString()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Block title="주문">
          <Facts
            rows={[
              ['사용자', order.userId],
              ['SIM', SIM_TYPE_LABELS[order.simType]],
              ['요금제 ID', String(order.planId)],
              ['금액', formatMoney(order.amount)],
              ['여행 시작일', formatLocalDate(order.travelStartDate)],
              ['생성', formatKstDateTime(order.createdAt)],
              ['결제 기한', formatKstDateTime(order.expiresAt)],
              ['발급', time(order.issuedAt)],
            ]}
          />
        </Block>
        <Block title="운영자 조치">
          <OperatorActions
            orderNo={order.orderNo}
            refund={manualRefundAvailability(order, profile)}
            reissue={reissueAvailability(order)}
            refundAction={manualRefundAction}
            reissueAction={reissueAction}
          />
        </Block>
      </div>

      <Block title={`상태 변경 이력 (${timeline.length})`}>
        {timeline.length === 0 ? <None /> : <Timeline entries={timeline} />}
      </Block>

      <Block title={`결제 시도 (${payments.length})`}>
        {payments.length === 0 ? (
          <None />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>멱등 키</Th>
                <Th>상태</Th>
                <Th className="text-right">금액</Th>
                <Th className="text-right">취소액</Th>
                <Th>PG 거래 ID</Th>
                <Th>실패 사유</Th>
                <Th>요청</Th>
                <Th>승인</Th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.idempotencyKey}>
                  <Td>{p.idempotencyKey}</Td>
                  <Td>
                    <PaymentStatusBadge status={p.status} />
                  </Td>
                  <Td className="text-right">{formatMoney(p.amount)}</Td>
                  <Td className="text-right">{formatMoney(p.cancelledAmount)}</Td>
                  <Td>{p.pgTid ?? '-'}</Td>
                  <Td>{p.failureReason ?? '-'}</Td>
                  <Td>{formatKstDateTime(p.requestedAt)}</Td>
                  <Td>{time(p.approvedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Block>

      <Block title={`발급 요청 (${issuanceRequests.length})`}>
        {issuanceRequests.length === 0 ? (
          <None />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>시도</Th>
                <Th>상태</Th>
                <Th>공급사 주문번호</Th>
                <Th>실패 사유</Th>
                <Th>요청</Th>
                <Th>완료</Th>
              </tr>
            </thead>
            <tbody>
              {issuanceRequests.map((r) => (
                <tr key={r.attempt}>
                  <Td>{r.attempt}</Td>
                  <Td>
                    <Badge tone={ISSUANCE_STATUS_LABELS[r.status].tone}>{ISSUANCE_STATUS_LABELS[r.status].label}</Badge>
                  </Td>
                  <Td>{r.supplierOrderNo ?? '-'}</Td>
                  <Td>{r.failureReason ?? '-'}</Td>
                  <Td>{formatKstDateTime(r.requestedAt)}</Td>
                  <Td>{time(r.completedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Block>

      <Block title="SIM 프로필">
        {profile ? (
          <Facts
            rows={[
              ['ICCID', profile.iccid],
              ['설치 상태', <InstallStatusBadge key="s" status={profile.status} />],
              ['사용 기간', formatUsageDays(profile.usageDays)],
              ['발급', formatKstDateTime(profile.issuedAt)],
              ['QR 확인', time(profile.qrViewedAt)],
              ['설치', time(profile.installedAt)],
              ['개통', time(profile.activatedAt)],
              ['기기에서 삭제', time(profile.deletedAt)],
              ['만료(KST)', profile.expiresAtKst ? formatKstLocalDateTime(profile.expiresAtKst) : '-'],
              ['환불 가능', profile.refundable ? '예' : '아니오(설치·개통됨)'],
            ]}
          />
        ) : (
          <None text="아직 발급된 SIM이 없어요." />
        )}
      </Block>

      <Block title={`환불 요청 (${refunds.length})`}>
        {refunds.length === 0 ? (
          <None />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>상태</Th>
                <Th className="text-right">금액</Th>
                <Th>시도 횟수</Th>
                <Th>다음 재시도</Th>
                <Th>마지막 오류</Th>
                <Th>요청</Th>
                <Th>완료</Th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r) => (
                <tr key={r.id}>
                  <Td>{r.id}</Td>
                  <Td>
                    <RefundStatusBadge status={r.status} />
                  </Td>
                  <Td className="text-right">{formatMoney(r.amount)}</Td>
                  <Td>{r.attemptCount}</Td>
                  <Td>{time(r.nextRetryAt)}</Td>
                  <Td>{r.lastError ?? '-'}</Td>
                  <Td>{formatKstDateTime(r.createdAt)}</Td>
                  <Td>{time(r.completedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Block>

      <Block title={`수신한 콜백·웹훅 (${callbacks.length})`}>
        {callbacks.length === 0 ? <None /> : <CallbackTable callbacks={callbacks} />}
      </Block>
    </div>
  );
}

/** One line per change: when · what (target and from → to) · who / which signal · why. */
function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="divide-y divide-line rounded-card bg-layer text-[14px]">
      {entries.map((e, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5">
          <time dateTime={e.occurredAt} className="text-fg-muted tabular-nums">
            {formatKstDateTime(e.occurredAt)}
          </time>
          <span className="font-medium text-fg">
            {HISTORY_TARGET_LABELS[e.targetType]}
            {e.targetType !== 'ORDER' && <span className="ml-1 text-xs text-fg-subtle">{e.targetKey}</span>}
          </span>
          <span className="text-fg">
            {e.fromStatus ? `${formatHistoryStatus(e.targetType, e.fromStatus)} → ` : ''}
            <strong>{formatHistoryStatus(e.targetType, e.toStatus)}</strong>
          </span>
          <span className="text-fg-brand">{formatActor(e.actor)}</span>
          {e.reason && <span className="text-fg-muted">· {e.reason}</span>}
        </li>
      ))}
    </ol>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-[16px] font-bold text-fg">{title}</h2>
      {children}
    </section>
  );
}

function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-card bg-layer p-4 text-[14px]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-fg-muted">{label}</dt>
          <dd className="text-fg tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function None({ text = '기록이 없어요.' }: { text?: string }) {
  return <p className="rounded-card bg-layer px-4 py-3 text-[14px] text-fg-muted">{text}</p>;
}

function time(instant: Instant | null): string {
  return instant ? formatKstDateTime(instant) : '-';
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-10 w-80 animate-pulse rounded-card bg-layer" />
      <div className="h-64 animate-pulse rounded-card bg-layer" />
      <div className="h-80 animate-pulse rounded-card bg-layer" />
    </div>
  );
}
