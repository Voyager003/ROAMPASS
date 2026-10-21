import 'server-only';

import { api } from '@/lib/api/client';
import type { AdminOrderFilter, AdminOrderSummary, Page, WithAsOf } from '@/lib/api/types';
import { getAdminId } from '@/lib/auth/session';

/** Admin order list as the current demo operator; `asOf` is when the backend read it. */
export async function listAdminOrders(filter: AdminOrderFilter): Promise<WithAsOf<Page<AdminOrderSummary>>> {
  return api.listAdminOrders(await getAdminId(), filter);
}
