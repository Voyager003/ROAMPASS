import Link from 'next/link';

import { AsOfIndicator } from '@/components/as-of-indicator';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiError } from '@/lib/api/errors';
import type { AdminOrderSummary, Page, WithAsOf } from '@/lib/api/types';

import { adminOrdersHref, pageCount, parseAdminOrderQuery, toAdminOrderFilter } from '../order-filter';
import { listAdminOrders } from '../queries';
import { OrderFilterForm } from './order-filter-form';
import { OrderTable } from './order-table';

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
        <OrderTable orders={data.content} />
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

export function OrderListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-20 animate-pulse rounded-card bg-layer" />
      <div className="h-96 animate-pulse rounded-card bg-layer" />
    </div>
  );
}
