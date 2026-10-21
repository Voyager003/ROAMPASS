import 'server-only';

import { cacheLife } from 'next/cache';
import { connection } from 'next/server';

import { api } from '@/lib/api/client';
import type { Plan } from '@/lib/api/types';

/**
 * The plan list is the only cached read (docs/decisions.md #10): the same for every user and it
 * rarely changes. `cacheLife('hours')` (node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md).
 */
async function fetchPlansCached(): Promise<Plan[]> {
  'use cache';
  cacheLife('hours');
  return api.listPlans();
}

/**
 * Reads the plan list at request time, then from the cache. `connection()` keeps the backend call out of
 * `next build` (the build must not need a running backend); behind request data the cached result is
 * kept in memory at runtime (01-getting-started/08-caching.md, "Because <CachedContent /> is gated behind
 * request data…"). Callers render under <Suspense>.
 */
export async function getPlans(): Promise<Plan[]> {
  await connection();
  return fetchPlansCached();
}
