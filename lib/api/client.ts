import 'server-only';

import { httpApi } from './http-client';

/**
 * The only way the app reaches the backend. Every method runs on the Next.js server
 * (Server Components and Server Actions); the browser never calls the backend (docs/decisions.md #3).
 *
 * - Identity arguments (userId / adminId) become the X-User-Id / X-Admin-Id headers.
 * - Idempotency (docs/decisions.md #6): only order creation carries an Idempotency-Key, created when
 *   the order form renders. Payment, refund and operator actions send none: the backend makes its own
 *   keys and answers a repeat with 409 (PAYMENT_IN_PROGRESS, REFUND_CONFLICT, ACTION_CONFLICT, …).
 * - Errors: methods throw ApiError (lib/api/errors.ts) for non-2xx responses. Reads whose 404
 *   is a normal outcome (missing or another user's order) return null instead.
 *
 * `features/*\/queries.ts` and `features/*\/actions.ts` are the only importers (CLAUDE.md §1).
 */
export type RoampassApi = typeof httpApi;

export const api: RoampassApi = httpApi;
