'use client';

import { ActionButton } from '@seed-design/react';
import { useActionState } from 'react';

import type { OrderNo } from '@/lib/api/types';

import type { DemoStepState } from '../actions';
import type { DemoSimButtons as Buttons } from '../demo';

type StepAction = (state: DemoStepState, formData: FormData) => Promise<DemoStepState>;

/**
 * Demo buttons on My SIM for an issued eSIM (docs/decisions.md #48): "기기에 설치하기" and
 * "현지에서 개통하기" change the mock supplier's profile instead of a real device.
 */
export function DemoSimButtons({ orderNo, buttons, stepAction }: { orderNo: OrderNo; buttons: Buttons; stepAction: StepAction }) {
  return (
    <div className="grid gap-2">
      <p className="text-[13px] text-fg-muted">
        시연용이에요. 실제 기기 대신 SIM 공급사의 상태를 바꿔 설치·개통을 흉내 내요. 설치하거나 개통하면 환불할 수 없어요.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {buttons.install && <StepButton orderNo={orderNo} step="install" label="기기에 설치하기" stepAction={stepAction} />}
        {buttons.activate && <StepButton orderNo={orderNo} step="activate" label="현지에서 개통하기" stepAction={stepAction} />}
      </div>
    </div>
  );
}

function StepButton({
  orderNo,
  step,
  label,
  stepAction,
}: {
  orderNo: OrderNo;
  step: 'install' | 'activate';
  label: string;
  stepAction: StepAction;
}) {
  const [state, formAction, pending] = useActionState(stepAction, { error: null });
  return (
    <form action={formAction} className="grid gap-1">
      <input type="hidden" name="orderNo" value={orderNo} />
      <input type="hidden" name="step" value={step} />
      <ActionButton type="submit" size="medium" variant="neutralWeak" loading={pending} disabled={pending}>
        {label}
      </ActionButton>
      {state.error && (
        <p role="alert" className="text-[13px] text-fg-critical">
          {state.error}
        </p>
      )}
    </form>
  );
}
