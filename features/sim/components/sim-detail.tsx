import { CalloutContent, CalloutDescription, CalloutRoot, CalloutTitle } from '@seed-design/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { InstallStatusBadge, OrderStatusBadge } from '@/components/status-badges';
import { Section, SectionTitle } from '@/components/ui/section';
import { refundOrderAction } from '@/features/order/actions';
import { RefundButton } from '@/features/order/components/refund-button';
import { isMoving } from '@/features/order/progress';
import { getMySim } from '@/features/order/queries';
import { getPlans } from '@/features/plan/queries';
import { ApiError } from '@/lib/api/errors';
import type { MySimDetail, Plan, SimInfo } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { formatKstDateTime, formatKstLocalDateTime, formatLocalDate } from '@/lib/format/kst';
import {
  formatCountry,
  formatRefundBlockReason,
  formatUsageDays,
  INSTALL_STATUS_LABELS,
  SIM_TYPE_LABELS,
} from '@/lib/format/labels';
import { formatDataMb, formatMoney } from '@/lib/format/money';

import { registerIccidAction, revealActivationCodeAction } from '../actions';
import { installSteps } from '../install-steps';
import { ActivationCodeReveal } from './activation-code-reveal';
import { IccidForm } from './iccid-form';
import { RemainingTime } from './remaining-time';

/**
 * Body of /my/sims/[orderNo] (assignment §2.3-⑥ 내 SIM): payment amount, issuance and install status,
 * time left with the KST expiry, whether a refund is possible (and why not), and the refund request.
 * Every judgement (refundable, remaining time, expiry) comes from the backend at read time.
 */
export async function SimDetail({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;

  let detail: MySimDetail | null;
  try {
    detail = await getMySim(orderNo);
  } catch (error) {
    if (error instanceof ApiError) {
      return (
        <p role="alert" className="m-5 rounded-card bg-layer px-5 py-6 text-[15px] text-fg-critical">
          SIM 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요. ({error.code})
        </p>
      );
    }
    throw error;
  }
  if (!detail) notFound();

  const plan = await findPlan(detail.planId);

  return (
    <div className="space-y-2">
      <Section>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[19px] font-bold text-fg">
            {plan ? formatCountry(plan.countryCode) : '데이터 SIM'}
            <span className="ml-2 text-[14px] font-medium text-fg-muted">{SIM_TYPE_LABELS[detail.simType]}</span>
          </p>
          <OrderStatusBadge status={detail.orderStatus} />
        </div>
        {plan && (
          <p className="mt-1 text-[14px] text-fg-muted">
            {formatUsageDays(plan.days)} · {formatDataMb(plan.dataMb)} · 여행 시작 {formatLocalDate(detail.travelStartDate)}
          </p>
        )}
        {isMoving(detail.orderStatus) && (
          <Link
            href={`/orders/${encodeURIComponent(detail.orderNo)}`}
            className="mt-3 inline-block text-[14px] font-bold text-fg-brand underline"
          >
            발급 진행 상황 보기
          </Link>
        )}
      </Section>

      {detail.orderStatus === 'PICKUP_READY' && (
        <Section>
          <SectionTitle>유심 등록</SectionTitle>
          <p className="mb-4 text-[14px] text-fg-muted">
            공항에서 유심을 받은 뒤 카드 뒷면의 ICCID를 등록하면 발급이 끝나요. 등록하면 현지 개통을 요청해요.
          </p>
          <IccidForm orderNo={detail.orderNo} registerAction={registerIccidAction} />
        </Section>
      )}

      {detail.sim && detail.simType === 'ESIM' && detail.orderStatus === 'ISSUED' && (
        <Section>
          <SectionTitle>eSIM 설치</SectionTitle>
          <ActivationCodeReveal orderNo={detail.orderNo} revealAction={revealActivationCodeAction} />
        </Section>
      )}

      {detail.sim && <SimSection sim={detail.sim} />}

      <Section>
        <SectionTitle>결제·환불</SectionTitle>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
          <dt className="text-fg-muted">결제 금액</dt>
          <dd className="text-right font-bold text-fg">{formatMoney(detail.amount)}</dd>
          <dt className="text-fg-muted">주문번호</dt>
          <dd className="text-right text-fg tabular-nums">{detail.orderNo}</dd>
          <dt className="text-fg-muted">주문 일시</dt>
          <dd className="text-right text-fg">{formatKstDateTime(detail.createdAt)}</dd>
          {detail.issuedAt && (
            <>
              <dt className="text-fg-muted">발급 일시</dt>
              <dd className="text-right text-fg">{formatKstDateTime(detail.issuedAt)}</dd>
            </>
          )}
        </dl>
        <div className="mt-5 grid gap-3 border-t border-line pt-4">
          {/* Refund state as a titled callout so the verdict stands out from the facts above. */}
          {detail.refundable ? (
            <>
              <CalloutRoot tone="informative">
                <CalloutContent>
                  <CalloutTitle>지금 환불할 수 있어요</CalloutTitle>
                  <CalloutDescription>설치하거나 개통한 뒤에는 환불할 수 없어요.</CalloutDescription>
                </CalloutContent>
              </CalloutRoot>
              <RefundButton orderNo={detail.orderNo} refundAction={refundOrderAction} />
            </>
          ) : (
            <CalloutRoot tone="neutral">
              <CalloutContent>
                <CalloutTitle>환불할 수 없어요</CalloutTitle>
                <CalloutDescription>{formatRefundBlockReason(detail)}</CalloutDescription>
              </CalloutContent>
            </CalloutRoot>
          )}
        </div>
      </Section>
    </div>
  );
}

function SimSection({ sim }: { sim: SimInfo }) {
  return (
    <Section>
      <SectionTitle>SIM 상태</SectionTitle>
      <ol className="mb-5 grid grid-cols-5 gap-1 text-center text-[11px]" aria-label="설치 상태">
        {installSteps(sim.installStatus).map((step) => (
          <li key={step.status} aria-current={step.current ? 'step' : undefined}>
            <span className={cn('mb-1 block h-1.5 rounded-full', step.reached ? 'bg-brand' : 'bg-weak')} />
            <span className={cn(step.current ? 'font-bold text-fg' : step.reached ? 'text-fg-muted' : 'text-fg-subtle')}>
              {INSTALL_STATUS_LABELS[step.status].label}
            </span>
          </li>
        ))}
      </ol>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
        <dt className="text-fg-muted">설치 상태</dt>
        <dd className="text-right">
          <InstallStatusBadge status={sim.installStatus} />
        </dd>
        <dt className="text-fg-muted">ICCID</dt>
        <dd className="text-right text-fg tabular-nums break-all">{sim.iccid}</dd>
        <dt className="text-fg-muted">사용 기간</dt>
        <dd className="text-right text-fg">개통 시점부터 {formatUsageDays(sim.usageDays)}</dd>
        {sim.activatedAt && (
          <>
            <dt className="text-fg-muted">개통</dt>
            <dd className="text-right text-fg">{formatKstDateTime(sim.activatedAt)}</dd>
          </>
        )}
        {sim.remainingSeconds !== null && (
          <>
            <dt className="text-fg-muted">남은 기간</dt>
            <dd className="text-right font-bold text-fg">
              <RemainingTime remainingSeconds={sim.remainingSeconds} />
            </dd>
          </>
        )}
        {sim.expiresAtKst && (
          <>
            <dt className="text-fg-muted">만료(KST)</dt>
            <dd className="text-right text-fg">{formatKstLocalDateTime(sim.expiresAtKst)}</dd>
          </>
        )}
      </dl>
      {!sim.activatedAt && (
        <p className="mt-3 text-[13px] text-fg-muted">사용 기간은 현지에서 개통한 시점부터 계산돼요.</p>
      )}
      {sim.deleted && <p className="mt-3 text-[13px] text-fg-critical">기기에서 삭제된 SIM이에요.</p>}
    </Section>
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

export function SimDetailSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <div className="h-28 animate-pulse bg-layer" />
      <div className="h-64 animate-pulse bg-layer" />
      <div className="h-48 animate-pulse bg-layer" />
    </div>
  );
}
