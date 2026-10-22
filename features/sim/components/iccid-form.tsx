'use client';

import { ActionButton } from '@seed-design/react';
import { useActionState, useState, useTransition } from 'react';

import type { OrderNo } from '@/lib/api/types';

import type { PickupCardState, RegisterState } from '../actions';
import { iccidError, normalizeIccid } from '../iccid';

/**
 * ICCID registration of a USIM picked up at the airport. The number is checked as it is typed
 * (19–20 digits + Luhn, features/sim/iccid.ts) so the button only enables for a well-formed number;
 * the server action checks again and the backend decides.
 * Demo (docs/decisions.md #48): "공항에서 유심 받기" asks the mock supplier for this order's card number
 * and fills it in; registering is still the user's press.
 */
export function IccidForm({
  orderNo,
  registerAction,
  pickupAction,
}: {
  orderNo: OrderNo;
  registerAction: (state: RegisterState, formData: FormData) => Promise<RegisterState>;
  pickupAction: (orderNo: OrderNo) => Promise<PickupCardState>;
}) {
  const [state, formAction, pending] = useActionState(registerAction, { error: null });
  const [input, setInput] = useState('');
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [picking, startPicking] = useTransition();

  const pickUp = () =>
    startPicking(async () => {
      const result = await pickupAction(orderNo);
      if ('iccid' in result) {
        setInput(result.iccid);
        setPickupError(null);
      } else {
        setPickupError(result.error);
      }
    });
  const iccid = normalizeIccid(input);
  const hint = iccid.length === 0 ? null : iccidError(iccid);

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="orderNo" value={orderNo} />
      <div className="mb-2 grid gap-1 rounded-lg bg-weak px-3 py-3">
        <p className="text-[13px] text-fg-muted">시연용이에요. 공항에서 받는 유심 카드 대신 SIM 공급사가 이 주문에 내준 번호를 받아 입력란에 채워요.</p>
        <ActionButton type="button" size="medium" variant="neutralWeak" onClick={pickUp} loading={picking} disabled={picking || pending}>
          공항에서 유심 받기
        </ActionButton>
        {pickupError && (
          <p role="alert" className="text-[13px] text-fg-critical">
            {pickupError}
          </p>
        )}
      </div>
      <label className="grid gap-1 text-[14px] text-fg">
        유심 ICCID
        <input
          name="iccid"
          inputMode="numeric"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="유심 카드 뒷면의 19~20자리 숫자"
          aria-invalid={hint !== null}
          aria-describedby="iccid-hint"
          className="h-12 rounded-lg border border-line bg-layer px-3 font-mono text-[16px] tracking-wide text-fg"
        />
      </label>
      <p id="iccid-hint" className="min-h-[1.25rem] text-[13px] text-fg-critical">
        {hint ?? state.error ?? ''}
      </p>
      <ActionButton type="submit" size="large" disabled={iccid.length === 0 || hint !== null || pending} loading={pending}>
        ICCID 등록
      </ActionButton>
    </form>
  );
}
