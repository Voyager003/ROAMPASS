import Link from 'next/link';

import { InstallStatusBadge, OrderStatusBadge } from '@/components/status-badges';
import { EmptyState } from '@/components/ui/empty-state';
import { getPlans } from '@/features/plan/queries';
import { ApiError } from '@/lib/api/errors';
import type { MySimSummary, Page, Plan } from '@/lib/api/types';
import { formatKstDate, formatLocalDate } from '@/lib/format/kst';
import { formatCountry, formatUsageDays, SIM_TYPE_LABELS } from '@/lib/format/labels';
import { formatDataMb, formatMoney } from '@/lib/format/money';

import { listMySims } from '../queries';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Body of /my/sims (assignment §2.3-⑥ 내 SIM): the user's paid orders, newest first, one card each.
 * A card shows the install status once the SIM is issued, the order status before that.
 */
export async function SimList({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const rawPage = Number([(await searchParams).page].flat()[0]);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;

  let result: Page<MySimSummary>;
  try {
    result = await listMySims(page);
  } catch (error) {
    if (error instanceof ApiError) {
      return (
        <p role="alert" className="m-5 rounded-card bg-layer px-5 py-6 text-[15px] text-fg-critical">
          내 SIM을 불러오지 못했어요. 잠시 후 다시 시도해 주세요. ({error.code})
        </p>
      );
    }
    throw error;
  }

  if (result.totalElements === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="아직 구매한 SIM이 없어요"
          description="여행할 나라를 골라 데이터 SIM을 구매해 보세요."
          action={
            <Link href="/" className="font-bold text-fg-brand underline">
              나라 고르기
            </Link>
          }
        />
      </div>
    );
  }

  const plans = await plansById();
  const lastPage = Math.max(0, Math.ceil(result.totalElements / result.size) - 1);

  return (
    <div className="space-y-3 p-5">
      <ul className="space-y-3">
        {result.content.map((sim) => (
          <li key={sim.orderNo}>
            <SimCard sim={sim} plan={plans.get(sim.planId) ?? null} />
          </li>
        ))}
      </ul>
      {lastPage > 0 && (
        <nav aria-label="페이지" className="flex items-center justify-center gap-4 pt-2 text-[14px]">
          <PageLink page={result.page > 0 ? result.page - 1 : null}>이전</PageLink>
          <span className="tabular-nums text-fg-muted">
            {result.page + 1} / {lastPage + 1}
          </span>
          <PageLink page={result.page < lastPage ? result.page + 1 : null}>다음</PageLink>
        </nav>
      )}
    </div>
  );
}

function SimCard({ sim, plan }: { sim: MySimSummary; plan: Plan | null }) {
  return (
    <Link
      href={`/my/sims/${encodeURIComponent(sim.orderNo)}`}
      className="block rounded-card bg-layer px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[17px] font-bold text-fg">
          {plan ? formatCountry(plan.countryCode) : '데이터 SIM'}
          <span className="ml-2 text-[13px] font-medium text-fg-muted">{SIM_TYPE_LABELS[sim.simType]}</span>
        </p>
        {sim.installStatus ? <InstallStatusBadge status={sim.installStatus} /> : <OrderStatusBadge status={sim.orderStatus} />}
      </div>
      <p className="mt-1 text-[14px] text-fg-muted">
        {plan ? `${formatUsageDays(plan.days)} · ${formatDataMb(plan.dataMb)} · ` : ''}
        여행 시작 {formatLocalDate(sim.travelStartDate)}
      </p>
      <p className="mt-2 flex justify-between text-[13px] text-fg-subtle">
        <span>주문 {formatKstDate(sim.createdAt)}</span>
        <span className="font-bold text-fg">{formatMoney(sim.amount)}</span>
      </p>
    </Link>
  );
}

function PageLink({ page, children }: { page: number | null; children: string }) {
  if (page === null) return <span className="text-fg-subtle">{children}</span>;
  return (
    <Link href={page === 0 ? '/my/sims' : `/my/sims?page=${page}`} className="font-medium text-fg-brand">
      {children}
    </Link>
  );
}

/** Country, days and data come from the cached plan list; without it the cards just omit them. */
async function plansById(): Promise<Map<number, Plan>> {
  try {
    return new Map((await getPlans()).map((p) => [p.planId, p]));
  } catch (error) {
    if (error instanceof ApiError) return new Map();
    throw error;
  }
}

export function SimListSkeleton() {
  return (
    <div className="space-y-3 p-5" aria-hidden>
      <div className="h-28 animate-pulse rounded-card bg-layer" />
      <div className="h-28 animate-pulse rounded-card bg-layer" />
    </div>
  );
}
