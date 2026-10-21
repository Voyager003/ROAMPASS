'use server';

import { refresh } from 'next/cache';

import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { OperatorActionResult, OrderNo, WithAsOf } from '@/lib/api/types';
import { getAdminId } from '@/lib/auth/session';
import { formatApiError } from '@/lib/format/errors';

import { formatActionError } from './action-policy';

export type OperatorActionState = { kind: 'done' | 'error'; message: string } | null;

const MAX_REASON_LENGTH = 500; // backend status_history.reason VARCHAR(500)

type Call = (adminId: string, orderNo: OrderNo, body: { reason: string }) => Promise<WithAsOf<OperatorActionResult>>;

/**
 * Shared body of the operator actions (assignment §2.3-⑤). The reason is required (the backend
 * records it in the history with the operator id). No idempotency key is sent: the backend changes
 * the order with a conditional UPDATE and answers a repeat or a race with 409 ACTION_CONFLICT
 * (docs/decisions.md #6). Success and 409 both refresh the page so it shows the current record.
 */
async function runAction(call: Call, doneMessage: string, formData: FormData): Promise<OperatorActionState> {
  const orderNo = String(formData.get('orderNo') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (!reason) return { kind: 'error', message: formatActionError('ADMIN_REASON_REQUIRED', formatApiError) };
  if (reason.length > MAX_REASON_LENGTH) {
    return { kind: 'error', message: `사유는 ${MAX_REASON_LENGTH}자 이내로 적어 주세요.` };
  }

  try {
    await call(await getAdminId(), orderNo, { reason });
    refresh();
    return { kind: 'done', message: doneMessage };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 409) refresh();
    return { kind: 'error', message: formatActionError(error.code, formatApiError) };
  }
}

export async function manualRefundAction(_prev: OperatorActionState, formData: FormData): Promise<OperatorActionState> {
  return runAction(api.refundOrder, '환불을 시작했어요. 환불 스케줄러가 PG 취소를 진행해요.', formData);
}

export async function reissueAction(_prev: OperatorActionState, formData: FormData): Promise<OperatorActionState> {
  return runAction(api.reissueOrder, '발급을 다시 요청했어요. 발급 스케줄러가 공급사에 보내요.', formData);
}
