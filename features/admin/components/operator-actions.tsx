'use client';

import { ActionButton } from '@seed-design/react';
import { useActionState } from 'react';

import type { OrderNo } from '@/lib/api/types';
import { cn } from '@/lib/cn';

import type { OperatorActionState } from '../actions';
import type { Availability } from '../action-policy';

type Action = (state: OperatorActionState, formData: FormData) => Promise<OperatorActionState>;

/**
 * Manual refund / reissue with a required reason. One form, two submit buttons (each with its own
 * Server Action via `formAction`). While either runs both are disabled; a button the backend would
 * refuse is disabled with the reason shown (action-policy.ts).
 */
export function OperatorActions({
  orderNo,
  refund,
  reissue,
  refundAction,
  reissueAction,
}: {
  orderNo: OrderNo;
  refund: Availability;
  reissue: Availability;
  refundAction: Action;
  reissueAction: Action;
}) {
  const [refundState, runRefund, refunding] = useActionState(refundAction, null);
  const [reissueState, runReissue, reissuing] = useActionState(reissueAction, null);
  const pending = refunding || reissuing;
  const nothingAllowed = !refund.allowed && !reissue.allowed;

  return (
    <form className="grid gap-3">
      <input type="hidden" name="orderNo" value={orderNo} />
      <label className="grid gap-1 text-[13px] text-fg-muted">
        사유 (필수, 이력에 운영자 ID와 함께 남아요)
        <textarea
          name="reason"
          required
          maxLength={500}
          rows={2}
          disabled={nothingAllowed}
          className="rounded-lg border border-line bg-layer px-3 py-2 text-[14px] text-fg disabled:bg-weak"
          placeholder="예: 고객 요청으로 환불, 공급사 장애 복구 후 재발급"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <ActionButton
          type="submit"
          formAction={runRefund}
          variant="neutralSolid"
          disabled={!refund.allowed || pending}
          loading={refunding}
        >
          수동 환불
        </ActionButton>
        <ActionButton
          type="submit"
          formAction={runReissue}
          variant="brandSolid"
          disabled={!reissue.allowed || pending}
          loading={reissuing}
        >
          발급 재시도
        </ActionButton>
      </div>
      <ul className="space-y-1 text-[13px] text-fg-muted">
        {!refund.allowed && <li>수동 환불: {refund.reason}</li>}
        {!reissue.allowed && <li>발급 재시도: {reissue.reason}</li>}
      </ul>
      {[refundState, reissueState].map(
        (state, i) =>
          state && (
            <p
              key={i}
              role={state.kind === 'error' ? 'alert' : 'status'}
              className={cn('text-[14px]', state.kind === 'error' ? 'text-fg-critical' : 'text-fg')}
            >
              {state.message}
            </p>
          ),
      )}
    </form>
  );
}
