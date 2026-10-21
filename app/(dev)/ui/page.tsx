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
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ChevronDownIcon } from '@/components/shell/icons';
import { ScreenHeader } from '@/components/shell/screen-header';
import {
  InstallStatusBadge,
  IssueTypeBadge,
  OrderStatusBadge,
  PaymentStatusBadge,
  RefundStatusBadge,
} from '@/components/status-badges';
import { BottomCta } from '@/components/ui/bottom-cta';
import { ChoiceChips } from '@/components/ui/choice-chips';
import { EmptyState } from '@/components/ui/empty-state';
import { Section, SectionTitle } from '@/components/ui/section';
import { Table, Td, Th } from '@/components/ui/table';
import { INSTALL_STATUSES, ISSUE_TYPES, ORDER_STATUSES, PAYMENT_STATUSES, REFUND_STATUSES } from '@/lib/api/types';

const DAYS = ['1', '2', '3', '4', '5', '7', '10', '15', '20', '30'].map((d) => ({ value: d, label: `${d}일` }));

/**
 * Development-only gallery (docs/decisions.md #16): the shell pieces and SEED components the screens
 * use, in every state, rendered from a Server Component. 404 in production builds.
 */
export default function UiGalleryPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-basement">
      <ScreenHeader title="UI 갤러리" backHref="/" />
      <div className="space-y-2">
        <Section>
          <SectionTitle hint="체류기간 내에서 선택">사용기간 선택 (선택됨)</SectionTitle>
          <ChoiceChips name="days-demo" legend="사용기간" options={DAYS} value="2" />
        </Section>
        <Section>
          <SectionTitle hint="*1일 사용 기준">데이터 선택 (선택 전 · 일부 비활성)</SectionTitle>
          <ChoiceChips
            name="data-demo"
            legend="데이터"
            columns={2}
            options={[
              { value: '2048', label: '2GB' },
              { value: '3072', label: '3GB', disabled: true },
            ]}
            value={null}
          />
        </Section>
        <Section>
          <SectionTitle>SIM 선택</SectionTitle>
          <ChoiceChips
            name="sim-demo"
            legend="SIM 종류"
            columns={2}
            options={[
              { value: 'ESIM', label: 'eSIM' },
              { value: 'USIM', label: 'USIM' },
            ]}
            value="ESIM"
          />
        </Section>
        <Section>
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
                      <CalloutTitle>잠깐! 등록 전 꼭 확인해 주세요</CalloutTitle>
                      <CalloutDescription>설치하거나 개통한 SIM은 환불할 수 없어요.</CalloutDescription>
                    </CalloutContent>
                  </CalloutRoot>
                  <TabsRoot defaultValue="how">
                    <TabsList>
                      <TabsTrigger value="how">사용 방법</TabsTrigger>
                      <TabsTrigger value="before">사용 전 확인</TabsTrigger>
                      <TabsTrigger value="arrive">도착 후 활성화</TabsTrigger>
                      <TabsTrigger value="notes">공통 유의</TabsTrigger>
                    </TabsList>
                    <TabsContent value="how"><p className="py-3 text-sm">STEP 1. 결제하면 QR 코드를 받아요.</p></TabsContent>
                    <TabsContent value="before"><p className="py-3 text-sm">eSIM 지원 기종인지 먼저 확인하세요.</p></TabsContent>
                    <TabsContent value="arrive"><p className="py-3 text-sm">도착하면 데이터 로밍을 켜요.</p></TabsContent>
                    <TabsContent value="notes"><p className="py-3 text-sm">설치·개통 후에는 환불할 수 없어요.</p></TabsContent>
                  </TabsRoot>
                </AccordionBody>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </Section>
        <Section className="space-y-3">
          <SectionTitle>상태 배지</SectionTitle>
          <div className="flex flex-wrap gap-1.5">{ORDER_STATUSES.map((s) => <OrderStatusBadge key={s} status={s} />)}</div>
          <div className="flex flex-wrap gap-1.5">{PAYMENT_STATUSES.map((s) => <PaymentStatusBadge key={s} status={s} />)}</div>
          <div className="flex flex-wrap gap-1.5">{INSTALL_STATUSES.map((s) => <InstallStatusBadge key={s} status={s} />)}</div>
          <div className="flex flex-wrap gap-1.5">{REFUND_STATUSES.map((s) => <RefundStatusBadge key={s} status={s} />)}</div>
          <div className="flex flex-wrap gap-1.5">{ISSUE_TYPES.map((t) => <IssueTypeBadge key={t} type={t} />)}</div>
        </Section>
        <Section className="space-y-3">
          <SectionTitle>표 (어드민)</SectionTitle>
          <Table>
            <thead>
              <tr><Th>주문번호</Th><Th>상태</Th><Th className="text-right">금액</Th></tr>
            </thead>
            <tbody>
              <tr><Td>ORD-20261020-AB12CD34</Td><Td><OrderStatusBadge status="NEEDS_ATTENTION" /></Td><Td className="text-right">19,900원</Td></tr>
            </tbody>
          </Table>
        </Section>
        <div className="px-5 py-6">
          <EmptyState
            title="아직 구매한 SIM이 없어요"
            description="여행할 나라의 요금제를 고르면 여기에서 발급 상태를 볼 수 있어요."
            action={<ActionButton asChild><Link href="/">요금제 보기</Link></ActionButton>}
          />
        </div>
        <Section>
          <SectionTitle>하단 버튼 (비활성 · 아래 고정은 활성)</SectionTitle>
          <ActionButton size="large" disabled className="w-full">결제하러 가기</ActionButton>
        </Section>
      </div>
      <BottomCta>
        <ActionButton size="large">결제하러 가기</ActionButton>
      </BottomCta>
    </div>
  );
}
