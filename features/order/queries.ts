import 'server-only';

import { api } from '@/lib/api/client';
import type { Order, OrderNo } from '@/lib/api/types';
import { getUserId } from '@/lib/auth/session';

/** The current demo user's order; null when missing or another user's (backend answers 404 for both). */
export async function getOrder(orderNo: OrderNo): Promise<Order | null> {
  return api.getOrder(await getUserId(), orderNo);
}
