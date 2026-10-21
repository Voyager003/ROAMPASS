'use server';

import { cookies } from 'next/headers';

import { COOKIE_BY_ROLE, isAdminId, isRole, isUserId } from './identities';

const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;

/**
 * Switches the demo identity of one role. Only ids from the fixed list are stored.
 * Setting a cookie in a Server Action returns the re-rendered page in the same round trip, so no
 * redirect or refresh() is needed (node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md,
 * "Understanding Cookie Behavior in Server Functions").
 */
export async function switchIdentity(formData: FormData): Promise<void> {
  const role = formData.get('role');
  const id = formData.get('id');
  if (!isRole(role)) return;
  const valid = role === 'user' ? isUserId(id) : isAdminId(id);
  if (!valid) return;

  (await cookies()).set(COOKIE_BY_ROLE[role], id as string, {
    httpOnly: true, // never readable from browser JavaScript (CLAUDE.md §9)
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_WEEK_SECONDS,
  });
}
