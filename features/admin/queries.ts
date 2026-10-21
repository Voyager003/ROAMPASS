import 'server-only';

import { api } from '@/lib/api/client';
import type { AdminOrderDetail, AdminOrderFilter, AdminOrderSummary, OrderNo, Page, WithAsOf } from '@/lib/api/types';
import { getAdminId } from '@/lib/auth/session';

/** Admin order list as the current demo operator; `asOf` is when the backend read it. */
export async function listAdminOrders(filter: AdminOrderFilter): Promise<WithAsOf<Page<AdminOrderSummary>>> {
  return api.listAdminOrders(await getAdminId(), filter);
}

/** One order's full record for operators; null when it does not exist. */
export async function getAdminOrder(orderNo: OrderNo): Promise<WithAsOf<AdminOrderDetail> | null> {
  return api.getAdminOrder(await getAdminId(), orderNo);
}
