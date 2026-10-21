'use server';

import { redirect } from 'next/navigation';

import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getUserId } from '@/lib/auth/session';
import { formatApiError } from '@/lib/format/errors';

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
