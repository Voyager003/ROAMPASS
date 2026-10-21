/**
 * Demo identities (docs/decisions.md #4). The assignment needs no member system (§2.2): user screens
 * act as `user-1` and admin screens as `admin-1` by default, and an identity chip switches to the
 * second id of the same role. The chosen id lives in an httpOnly cookie; the server turns it into
 * X-User-Id / X-Admin-Id on backend calls.
 *
 * No runtime dependencies, so the rules here are unit-tested (identities.test.ts).
 */
export const USER_IDS = ['user-1', 'user-2'] as const;
export const ADMIN_IDS = ['admin-1', 'admin-2'] as const;

export type DemoUserId = (typeof USER_IDS)[number];
export type DemoAdminId = (typeof ADMIN_IDS)[number];
export type Role = 'user' | 'admin';

export const DEFAULT_USER_ID: DemoUserId = 'user-1';
export const DEFAULT_ADMIN_ID: DemoAdminId = 'admin-1';

export const USER_COOKIE = 'roampass_user_id';
export const ADMIN_COOKIE = 'roampass_admin_id';
export const COOKIE_BY_ROLE: Record<Role, string> = { user: USER_COOKIE, admin: ADMIN_COOKIE };

export function isUserId(value: unknown): value is DemoUserId {
  return typeof value === 'string' && (USER_IDS as readonly string[]).includes(value);
}

export function isAdminId(value: unknown): value is DemoAdminId {
  return typeof value === 'string' && (ADMIN_IDS as readonly string[]).includes(value);
}

export function isRole(value: unknown): value is Role {
  return value === 'user' || value === 'admin';
}

/** Cookie value → user id. Missing or unknown values fall back to the default instead of reaching the backend. */
export function resolveUserId(cookieValue: unknown): DemoUserId {
  return isUserId(cookieValue) ? cookieValue : DEFAULT_USER_ID;
}

export function resolveAdminId(cookieValue: unknown): DemoAdminId {
  return isAdminId(cookieValue) ? cookieValue : DEFAULT_ADMIN_ID;
}

/** The other id of the same role (two ids per role, so the chip toggles). */
export function otherId(role: Role, current: string): string {
  const ids: readonly string[] = role === 'user' ? USER_IDS : ADMIN_IDS;
  return ids.find((id) => id !== current) ?? ids[0];
}
