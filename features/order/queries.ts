import 'server-only';

import { api } from '@/lib/api/client';
import type { MySimDetail, Order, OrderNo } from '@/lib/api/types';
import { getUserId } from '@/lib/auth/session';

/** The current demo user's order; null when missing or another user's (backend answers 404 for both). */
export async function getOrder(orderNo: OrderNo): Promise<Order | null> {
  return api.getOrder(await getUserId(), orderNo);
}

/**
 * The current demo user's order after payment: status, refundability, issued SIM and the issuance
 * waiting info. The order page reads this for every status past PENDING / EXPIRED (docs/decisions.md #27).
 */
export async function getMySim(orderNo: OrderNo): Promise<MySimDetail | null> {
  return api.getMySim(await getUserId(), orderNo);
}
