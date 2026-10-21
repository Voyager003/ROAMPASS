import Link from 'next/link';

import { AsOfIndicator } from '@/components/as-of-indicator';
import { InstallStatusBadge, OrderStatusBadge, PaymentStatusBadge } from '@/components/status-badges';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Td, Th } from '@/components/ui/table';
import { ApiError } from '@/lib/api/errors';
import type { AdminOrderSummary, Page, WithAsOf } from '@/lib/api/types';
import { formatKstDateTime } from '@/lib/format/kst';
import { SIM_TYPE_LABELS } from '@/lib/format/labels';
import { formatMoney } from '@/lib/format/money';

import { adminOrdersHref, pageCount, parseAdminOrderQuery, toAdminOrderFilter } from '../order-filter';
import { listAdminOrders } from '../queries';
import { OrderFilterForm } from './order-filter-form';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Body of /admin/orders (assignment §2.3-⑤): filter bar, "N초 전 데이터", table, pagination.
 * Reads searchParams and the backend at request time, so it renders under <Suspense>.
 */
export async function OrderList({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = parseAdminOrderQuery(await searchParams);

  let result: WithAsOf<Page<AdminOrderSummary>>;
  try {
    result = await listAdminOrders(toAdminOrderFilter(query));
  } catch (error) {
    if (error instanceof ApiError) {
      return (
        <>
          <OrderFilterForm query={query} />
          <p role="alert" className="rounded-card bg-layer px-5 py-6 text-[15px] text-fg-critical">
            주문 목록을 불러오지 못했어요. ({error.code}) {error.problem.detail}
          </p>
        </>
      );
    }
    throw error;
  }

  const { asOf, data } = result;
  const pages = pageCount(data.totalElements, data.size);

  return (
    <>
      <OrderFilterForm query={query} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-fg">
          총 <strong className="tabular-nums">{data.totalElements}</strong>건
        </p>
        <AsOfIndicator asOf={asOf} serverNow={new Date().toISOString()} />
      </div>

      {data.content.length === 0 ? (
        <EmptyState title="조건에 맞는 주문이 없어요" description="필터를 바꾸거나 초기화해 보세요." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>주문번호</Th>
              <Th>사용자</Th>
              <Th>SIM</Th>
              <Th className="text-right">금액</Th>
              <Th>주문 상태</Th>
              <Th>결제 상태</Th>
              <Th>설치 상태</Th>
              <Th>생성(KST)</Th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((order) => (
              <tr key={order.orderNo}>
                <Td>
                  <Link
                    href={`/admin/orders/${encodeURIComponent(order.orderNo)}`}
                    className="font-medium text-fg-brand hover:underline"
                  >
                    {order.orderNo}
                  </Link>
                </Td>
                <Td>{order.userId}</Td>
                <Td>{SIM_TYPE_LABELS[order.simType]}</Td>
                <Td className="text-right">{formatMoney(order.amount)}</Td>
                <Td>
                  <OrderStatusBadge status={order.orderStatus} />
                </Td>
                <Td>{order.paymentStatus ? <PaymentStatusBadge status={order.paymentStatus} /> : <Dash />}</Td>
                <Td>{order.installStatus ? <InstallStatusBadge status={order.installStatus} /> : <Dash />}</Td>
                <Td>{formatKstDateTime(order.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <nav aria-label="페이지" className="mt-4 flex items-center justify-center gap-4 text-[14px]">
        <PageLink href={data.page > 0 ? adminOrdersHref(query, data.page - 1) : null}>이전</PageLink>
        <span className="tabular-nums text-fg-muted">
          {data.page + 1} / {pages}
        </span>
        <PageLink href={data.page + 1 < pages ? adminOrdersHref(query, data.page + 1) : null}>다음</PageLink>
      </nav>
    </>
  );
}

function PageLink({ href, children }: { href: string | null; children: string }) {
  if (!href) return <span className="text-fg-subtle">{children}</span>;
  return (
    <Link href={href} className="font-medium text-fg-brand hover:underline">
      {children}
    </Link>
  );
}

function Dash() {
  return <span className="text-fg-subtle">-</span>;
}

export function OrderListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-20 animate-pulse rounded-card bg-layer" />
      <div className="h-96 animate-pulse rounded-card bg-layer" />
    </div>
  );
}
