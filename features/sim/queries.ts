import 'server-only';

import { api } from '@/lib/api/client';
import type { MySimSummary, Page } from '@/lib/api/types';
import { getUserId } from '@/lib/auth/session';

export const MY_SIMS_PAGE_SIZE = 20;

/** The current demo user's paid orders (PENDING / EXPIRED excluded by the backend), newest first. */
export async function listMySims(page: number): Promise<Page<MySimSummary>> {
  return api.listMySims(await getUserId(), page, MY_SIMS_PAGE_SIZE);
}
