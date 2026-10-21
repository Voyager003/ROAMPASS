import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Section, SectionTitle } from '@/components/ui/section';
import { getPlans } from '@/features/plan/queries';
import { ApiError } from '@/lib/api/errors';
import type { MySimDetail, Order, Plan } from '@/lib/api/types';
import { formatLocalDate } from '@/lib/format/kst';
import { formatCountry, formatUsageDays, SIM_TYPE_LABELS } from '@/lib/format/labels';
import { formatDataMb, formatMoney } from '@/lib/format/money';

import { payOrderAction } from '../actions';
import { getMySim, getOrder } from '../queries';
import { OrderProgress } from './order-progress';
import { PaymentPanel } from './payment-panel';

/**
 * Server part of /orders/[orderNo]. One page follows the order through its steps:
 * PENDING → payment, EXPIRED → expired screen (both from GET /api/orders/{orderNo}, which has the
 * payment deadline); every later status → OrderProgress from GET /api/sims/{orderNo}, which has the
 * waiting info and refundability (docs/decisions.md #27).
 * Missing or another user's order → 404 (the backend answers 404 for both).
 */
export async function OrderScreen({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;

  let order: Order | null;
  try {
    order = await getOrder(orderNo);
  } catch (error) {
    if (error instanceof ApiError) return <LoadError code={error.code} />;
    throw error;
  }
  if (!order) notFound();

  if (order.status !== 'PENDING' && order.status !== 'EXPIRED') {
    return <AfterPayment orderNo={order.orderNo} />;
  }

  // The order carries only planId; country, days and data come from the cached plan list.
  // If that list is unavailable the summary simply omits them.
  const plan = await findPlan(order.planId);

  switch (order.status) {
    case 'PENDING':
      return (
        <div className="space-y-2">
          <PaymentPanel
            orderNo={order.orderNo}
            expiresAt={order.expiresAt}
            serverNow={new Date().toISOString()}
            payAction={payOrderAction}
          />
          <OrderSummary order={order} plan={plan} />
        </div>
      );
    case 'EXPIRED':
      return (
        <div className="space-y-2">
          <Section className="text-center">
            <p className="text-[17px] font-bold text-fg">결제 기한이 지났어요</p>
            <p className="mt-2 text-[14px] text-fg-muted">주문 후 10분 안에 결제하지 않아 주문이 만료됐어요.</p>
            <Link
              href={plan ? `/plans/${plan.countryCode.toLowerCase()}` : '/'}
              className="mt-5 inline-block rounded-xl bg-brand px-5 py-3 text-[15px] font-bold text-fg-inverted"
            >
              다시 고르기
            </Link>
          </Section>
          <OrderSummary order={order} plan={plan} />
        </div>
      );
  }
}

async function AfterPayment({ orderNo }: { orderNo: string }) {
  let detail: MySimDetail | null;
  try {
    detail = await getMySim(orderNo);
  } catch (error) {
    if (error instanceof ApiError) return <LoadError code={error.code} />;
    throw error;
  }
  if (!detail) notFound();
  const plan = await findPlan(detail.planId);
  return (
    <div className="space-y-2">
      <OrderProgress detail={detail} />
      <OrderSummary order={detail} plan={plan} />
    </div>
  );
}

function LoadError({ code }: { code: string }) {
  return (
    <p role="alert" className="m-5 rounded-card bg-layer px-5 py-6 text-[15px] text-fg-critical">
      주문을 불러오지 못했어요. 잠시 후 다시 시도해 주세요. ({code})
    </p>
  );
}

async function findPlan(planId: number): Promise<Plan | null> {
  try {
    return (await getPlans()).find((p) => p.planId === planId) ?? null;
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}

type SummaryFields = Pick<Order, 'orderNo' | 'simType' | 'amount' | 'travelStartDate'>;

function OrderSummary({ order, plan }: { order: SummaryFields; plan: Plan | null }) {
  return (
    <Section>
      <SectionTitle>주문 내용</SectionTitle>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
        {plan && <Row label="국가" value={formatCountry(plan.countryCode)} />}
        <Row label="SIM" value={SIM_TYPE_LABELS[order.simType]} />
        {plan && <Row label="사용 기간" value={formatUsageDays(plan.days)} />}
        {plan && <Row label="데이터" value={formatDataMb(plan.dataMb)} />}
        <Row label="여행 시작일" value={formatLocalDate(order.travelStartDate)} />
        <Row label="주문번호" value={order.orderNo} />
        <dt className="pt-2 font-bold text-fg">결제 금액</dt>
        <dd className="pt-2 text-right text-[17px] font-bold text-fg">{formatMoney(order.amount)}</dd>
      </dl>
    </Section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-fg-muted">{label}</dt>
      <dd className="text-right text-fg">{value}</dd>
    </>
  );
}

export function OrderScreenSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <div className="h-36 animate-pulse bg-layer" />
      <div className="h-64 animate-pulse bg-layer" />
    </div>
  );
}
