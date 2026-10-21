'use client';

import {
  AccordionBody,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionSuffixIcon,
  AccordionTitle,
  AccordionTrigger,
  ActionButton,
  CalloutContent,
  CalloutDescription,
  CalloutRoot,
  CalloutTitle,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '@seed-design/react';
import { useActionState, useState } from 'react';

import { ChevronDownIcon } from '@/components/shell/icons';
import type { OrderFormState } from '@/features/order/actions';
import { BottomCta } from '@/components/ui/bottom-cta';
import { ChoiceChips } from '@/components/ui/choice-chips';
import { Section, SectionTitle } from '@/components/ui/section';
import type { LocalDate, Money, Plan, SimType } from '@/lib/api/types';
import { formatLocalDate } from '@/lib/format/kst';
import { formatUsageDays, SIM_TYPE_LABELS } from '@/lib/format/labels';
import { formatDataMb, formatMoney } from '@/lib/format/money';

import { FEATURES, GUIDE_TABS, NOTICE } from '../guide';
import { applyChoice, dataOptions, dayOptions, EMPTY_SELECTION, type PlanSelection, resolvePlan, simOptions } from '../selection';
import { TravelDateCalendar } from './travel-date-calendar';

/**
 * Configure screen body, after the demo video's eSIM purchase screen (docs/decisions.md #32–#38).
 * A Client Component because every chip narrows the plans instantly; the choice lives in one
 * `useState` (docs/decisions.md #37). The plan list and today's KST date come from the Server
 * Component, so nothing here talks to the backend.
 *
 * The CTA is a form for the order-creation Server Action, passed in by the Server Component (Server
 * Actions are the only functions that may cross into a Client Component). `useActionState` gives the
 * pending flag (button disabled while the request runs) and the error message
 * (node_modules/next/dist/docs/01-app/02-guides/forms.md).
 */
export function PlanConfigurator({
  countryName,
  plans,
  minPrice,
  today,
  maxDate,
  orderAction,
  idempotencyKey,
}: {
  countryName: string;
  plans: Plan[];
  minPrice: Money;
  today: LocalDate;
  maxDate: LocalDate;
  orderAction: (state: OrderFormState, formData: FormData) => Promise<OrderFormState>;
  /** Created once when the screen rendered (docs/decisions.md #6). */
  idempotencyKey: string;
}) {
  const [startDate, setStartDate] = useState<LocalDate | null>(null);
  const [selection, setSelection] = useState<PlanSelection>(EMPTY_SELECTION);
  const [formState, formAction, pending] = useActionState(orderAction, { error: null });

  const choose = (change: Partial<PlanSelection>) => setSelection((current) => applyChoice(plans, current, change));
  const plan = resolvePlan(plans, selection);
  const guideSim: SimType = selection.simType ?? 'ESIM';
  const complete = plan !== null && startDate !== null;

  return (
    <>
      <div className="space-y-2">
        <section className="bg-brand px-5 pt-8 pb-7 text-fg-inverted">
          <p className="inline-block rounded-full bg-fg-inverted/15 px-2.5 py-1 text-xs font-medium">출국 전에 미리 준비</p>
          <h2 className="mt-3 text-[24px] leading-tight font-bold">{countryName} 여행 데이터</h2>
          <p className="mt-1 text-sm opacity-85">이심은 QR로 바로, 유심은 공항에서 받아요</p>
        </section>

        <Section>
          <p className="text-[15px] text-fg">
            단 <strong className="text-[26px] font-bold tabular-nums">{formatMoney(minPrice)}</strong> 부터
          </p>
          <p className="mt-1 text-[13px] text-fg-muted">{countryName}에서 쓰는 데이터 요금제</p>
          <div className="mt-4">
            <CalloutRoot tone={guideSim === 'ESIM' ? 'informative' : 'neutral'}>
              <CalloutContent>
                <CalloutDescription>{NOTICE[guideSim]}</CalloutDescription>
              </CalloutContent>
            </CalloutRoot>
          </div>
          <ul className="mt-3 grid grid-cols-3 divide-x divide-line rounded-xl border border-line text-center">
            {FEATURES[guideSim].map((f) => (
              <li key={f.title} className="px-2 py-3">
                <p className="text-sm font-bold text-fg">{f.title}</p>
                <p className="mt-0.5 text-[11px] text-fg-muted">{f.detail}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <SectionTitle hint="한국 시간 기준">여행 시작일 선택</SectionTitle>
          <TravelDateCalendar min={today} max={maxDate} value={startDate} onValueChange={setStartDate} />
        </Section>

        <Section>
          <SectionTitle hint="개통 시점부터 계산">사용기간 선택</SectionTitle>
          <ChoiceChips
            name="days"
            legend="사용기간"
            columns={chipColumns(dayOptions(plans).length)}
            options={dayOptions(plans).map((d) => ({ value: String(d), label: `${d}일` }))}
            value={selection.days === null ? null : String(selection.days)}
            onValueChange={(v) => choose({ days: Number(v) })}
          />
        </Section>

        <Section>
          <SectionTitle hint="사용 기간 전체">데이터 선택</SectionTitle>
          <ChoiceChips
            name="data"
            legend="데이터"
            columns={chipColumns(dataOptions(plans, selection.days).length)}
            options={dataOptions(plans, selection.days).map((mb) => ({ value: String(mb), label: formatDataMb(mb) }))}
            value={selection.dataMb === null ? null : String(selection.dataMb)}
            onValueChange={(v) => choose({ dataMb: Number(v) })}
          />
        </Section>

        <Section>
          <SectionTitle>SIM 선택</SectionTitle>
          <ChoiceChips
            name="simType"
            legend="SIM 종류"
            columns={2}
            options={(['ESIM', 'USIM'] as const).map((t) => ({
              value: t,
              label: t === 'ESIM' ? 'eSIM' : 'USIM',
              disabled: !simOptions(plans, selection.days, selection.dataMb).includes(t),
            }))}
            value={selection.simType}
            onValueChange={(v) => choose({ simType: v as SimType })}
          />
          <div className="mt-5">
            <AccordionRoot defaultValues={['guide']}>
              <AccordionItem value="guide">
                <AccordionHeader>
                  <AccordionTrigger>
                    <AccordionTitle>사용자 가이드</AccordionTitle>
                    <AccordionSuffixIcon>
                      <ChevronDownIcon />
                    </AccordionSuffixIcon>
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>
                  <AccordionBody className="space-y-4">
                    <CalloutRoot tone="warning">
                      <CalloutContent>
                        <CalloutTitle>잠깐! 구매 전에 꼭 확인해 주세요</CalloutTitle>
                        <CalloutDescription>
                          아래 절차를 모두 마쳐야 정상적으로 쓸 수 있어요. 설치하거나 개통한 SIM은 환불할 수 없어요.
                        </CalloutDescription>
                      </CalloutContent>
                    </CalloutRoot>
                    <GuideTabs simType={guideSim} />
                  </AccordionBody>
                </AccordionContent>
              </AccordionItem>
            </AccordionRoot>
          </div>
        </Section>

        <Section>
          <SectionTitle>옵션 선택 정보</SectionTitle>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-[15px]">
            <SummaryRow label="여행 시작일" value={startDate ? formatLocalDate(startDate) : null} />
            <SummaryRow label="SIM" value={selection.simType ? SIM_TYPE_LABELS[selection.simType] : null} />
            <SummaryRow label="사용 기간" value={selection.days !== null ? formatUsageDays(selection.days) : null} />
            <SummaryRow label="데이터" value={selection.dataMb !== null ? formatDataMb(selection.dataMb) : null} />
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[15px] text-fg-muted">결제금액</span>
            <strong className="text-[20px] font-bold text-fg-brand tabular-nums">{plan ? formatMoney(plan.price) : '- 원'}</strong>
          </div>
        </Section>
      </div>

      <BottomCta>
        <form action={formAction} className="grid gap-2">
          {formState.error && (
            <p role="alert" className="text-center text-[13px] text-fg-critical">
              {formState.error}
            </p>
          )}
          <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
          {complete && (
            <>
              <input type="hidden" name="planId" value={plan.planId} />
              <input type="hidden" name="travelStartDate" value={startDate} />
            </>
          )}
          <ActionButton type="submit" size="large" disabled={!complete || pending} loading={pending}>
            결제하러 가기
          </ActionButton>
        </form>
      </BottomCta>
    </>
  );
}

function GuideTabs({ simType }: { simType: SimType }) {
  const tabs = GUIDE_TABS[simType];
  return (
    <TabsRoot key={simType} defaultValue={tabs[0].value}>
      <TabsList>
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          <div className="space-y-2 pt-3">
            {t.steps?.map((s, i) => (
              <div key={s.title} className="rounded-xl bg-weak p-4">
                <p className="text-xs font-bold text-fg-brand">STEP {i + 1}.</p>
                <p className="mt-1 text-[15px] font-bold text-fg">{s.title}</p>
                <p className="mt-1 text-[13px] text-fg-muted">{s.body}</p>
              </div>
            ))}
            {t.bullets && (
              <ul className="list-disc space-y-1.5 pl-5 text-[13px] text-fg-muted">
                {t.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      ))}
    </TabsRoot>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <>
      <dt className="text-fg-muted">{label}</dt>
      <dd className="text-right text-fg">{value ?? '-'}</dd>
    </>
  );
}

function chipColumns(count: number): 2 | 3 | 4 | 5 {
  return count <= 2 ? 2 : count === 3 ? 3 : count === 4 ? 4 : 5;
}
