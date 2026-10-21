import 'server-only';

import { cookies } from 'next/headers';

import { ADMIN_COOKIE, type DemoAdminId, type DemoUserId, resolveAdminId, resolveUserId, USER_COOKIE } from './identities';

/**
 * Reads the demo identity on the server (docs/decisions.md #4). Never called from Client Components.
 * There is no login: a missing or unknown cookie means the default id, never "not signed in".
 * Reading cookies is request-time data, so callers render under <Suspense> (Cache Components).
 */
export async function getUserId(): Promise<DemoUserId> {
  return resolveUserId((await cookies()).get(USER_COOKIE)?.value);
}

export async function getAdminId(): Promise<DemoAdminId> {
  return resolveAdminId((await cookies()).get(ADMIN_COOKIE)?.value);
}
