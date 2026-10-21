import type { PayResult } from '@/lib/api/types';
import { formatApiError } from '@/lib/format/errors';

/**
 * What the payment form shows after one attempt. `null` = nothing to show (approved: the page
 * re-renders into the next step).
 */
export type PaymentFormState = { kind: 'error' | 'confirming'; message: string } | null;

export const CONFIRMING_MESSAGE =
  '결제 결과를 확인하고 있어요. 다시 결제하지 않아도 돼요. 1~2분 뒤 새로고침하면 결과가 반영돼요.';

/**
 * Maps POST /pay's result. REQUESTED means the PG's answer was lost (timeout / 5xx): the backend
 * settles it later by webhook or inquiry, so the user must not pay again (backend README §2.4).
 */
export function paymentStateOf(result: Pick<PayResult, 'paymentStatus'>): PaymentFormState {
  switch (result.paymentStatus) {
    case 'APPROVED':
      return null;
    case 'REQUESTED':
      return { kind: 'confirming', message: CONFIRMING_MESSAGE };
    case 'FAILED':
      return { kind: 'error', message: '결제가 승인되지 않았어요. 다시 시도해 주세요.' };
    default:
      // CANCELLED / PARTIALLY_CANCELLED do not occur for a fresh attempt; show it rather than hide it.
      return { kind: 'error', message: `결제 상태를 확인해 주세요. (${result.paymentStatus})` };
  }
}

/**
 * Maps an error code from POST /pay. PAYMENT_IN_PROGRESS = an earlier attempt is still REQUESTED
 * (e.g. after a reload, since GET /api/orders/{orderNo} carries no payment status — known limit).
 */
export function paymentErrorStateOf(code: string): PaymentFormState {
  if (code === 'PAYMENT_IN_PROGRESS') return { kind: 'confirming', message: CONFIRMING_MESSAGE };
  return { kind: 'error', message: formatApiError(code) };
}
