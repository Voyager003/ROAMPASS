'use client';

import { ActionButton } from '@seed-design/react';
import { useActionState, useState } from 'react';

import type { OrderNo } from '@/lib/api/types';

import type { RegisterState } from '../actions';
import { iccidError, normalizeIccid } from '../iccid';

/**
 * ICCID registration of a USIM picked up at the airport. The number is checked as it is typed
 * (19–20 digits + Luhn, features/sim/iccid.ts) so the button only enables for a well-formed number;
 * the server action checks again and the backend decides.
 */
export function IccidForm({
  orderNo,
  registerAction,
}: {
  orderNo: OrderNo;
  registerAction: (state: RegisterState, formData: FormData) => Promise<RegisterState>;
}) {
  const [state, formAction, pending] = useActionState(registerAction, { error: null });
  const [input, setInput] = useState('');
  const iccid = normalizeIccid(input);
  const hint = iccid.length === 0 ? null : iccidError(iccid);

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="orderNo" value={orderNo} />
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
