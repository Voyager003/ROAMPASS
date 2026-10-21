'use server';

import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';

import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getUserId } from '@/lib/auth/session';
import { formatApiError } from '@/lib/format/errors';

import { type PaymentFormState, paymentErrorStateOf, paymentStateOf } from './payment';

export type OrderFormState = { error: string | null };

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Creates the order and moves to its page (assignment §2.3-①). The Idempotency-Key comes from the form:
 * it was created once when the configure screen rendered, so a resubmit after a lost response or a
 * server restart returns the same order instead of a second one (docs/decisions.md #6, backend #99).
 * Used with useActionState: errors come back as state, success redirects.
 */
export async function createOrderAction(_prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const planId = Number(formData.get('planId'));
  const travelStartDate = String(formData.get('travelStartDate') ?? '');
  const idempotencyKey = String(formData.get('idempotencyKey') ?? '');
  if (!Number.isInteger(planId) || planId <= 0 || !LOCAL_DATE.test(travelStartDate) || !idempotencyKey) {
    return { error: '여행 시작일·사용기간·데이터·SIM을 모두 골라 주세요.' };
  }

  let orderNo: string;
  try {
    const order = await api.createOrder(await getUserId(), { planId, travelStartDate }, idempotencyKey);
    orderNo = order.orderNo;
  } catch (error) {
    if (error instanceof ApiError) return { error: formatApiError(error.code) };
    throw error;
  }
  // Outside try/catch: redirect() works by throwing.
  redirect(`/orders/${encodeURIComponent(orderNo)}`);
}

/**
 * Pays the order (assignment §2.3-①). No key is sent: the backend makes one per attempt and refuses
 * a second attempt while one is unresolved (409 PAYMENT_IN_PROGRESS), so a double click cannot
 * charge twice (docs/decisions.md #6). After a result that changes the order (approved, or the order
 * is no longer payable) the page is refreshed so it renders the order's new step.
 */
export async function payOrderAction(_prev: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  const orderNo = String(formData.get('orderNo') ?? '');
  if (!orderNo) return { kind: 'error', message: formatApiError('ORDER_NOT_FOUND') };

  try {
    const result = await api.payOrder(await getUserId(), orderNo);
    if (result.orderStatus !== 'PENDING') refresh();
    return paymentStateOf(result);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.code === 'ORDER_NOT_PAYABLE') refresh();
    return paymentErrorStateOf(error.code);
  }
}

export type RefundFormState = { error: string | null };

/**
 * User refund request while issuance has not been sent to the supplier yet (backend `UserRefundPolicy`,
 * offered only when `waiting.actions` has REQUEST_REFUND). 202 → the order is REFUNDING; the page is
 * refreshed to show it. A 409 means the order moved on meanwhile (e.g. issuance started): the message is
 * shown and the page refreshed to its current step. Repeats are safe: the backend accepts one (409 for others).
 */
export async function refundOrderAction(_prev: RefundFormState, formData: FormData): Promise<RefundFormState> {
  const orderNo = String(formData.get('orderNo') ?? '');
  if (!orderNo) return { error: formatApiError('ORDER_NOT_FOUND') };

  try {
    await api.requestRefund(await getUserId(), orderNo);
    refresh();
    return { error: null };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 409) refresh();
    return { error: formatApiError(error.code) };
  }
}
