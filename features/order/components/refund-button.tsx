'use client';

import { ActionButton } from '@seed-design/react';
import { useActionState } from 'react';

import type { OrderNo } from '@/lib/api/types';

import type { RefundFormState } from '../actions';

/** "지금 환불 요청하기" form for the issuance-waiting screen (Server Action via useActionState). */
export function RefundButton({
  orderNo,
  refundAction,
}: {
  orderNo: OrderNo;
  refundAction: (state: RefundFormState, formData: FormData) => Promise<RefundFormState>;
}) {
  const [state, formAction, pending] = useActionState(refundAction, { error: null });
  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="orderNo" value={orderNo} />
      <ActionButton type="submit" variant="neutralOutline" disabled={pending} loading={pending}>
        지금 환불 요청하기
      </ActionButton>
      {state.error && (
        <p role="alert" className="text-[13px] text-fg-critical">
          {state.error}
        </p>
      )}
    </form>
  );
}
