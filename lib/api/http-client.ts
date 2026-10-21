import 'server-only';

import { ApiError } from './errors';
import type {
  AdminIssues,
  AdminOrderDetail,
  AdminOrderFilter,
  AdminOrderSummary,
  CreateOrderRequest,
  MySimDetail,
  MySimSummary,
  OperatorActionRequest,
  OperatorActionResult,
  Order,
  OrderNo,
  Page,
  PayResult,
  Plan,
  PlanFilter,
  ProblemDetail,
  RefundResult,
  UsimRegistrationResult,
  WithAsOf,
} from './types';

/**
 * HTTP implementation of RoampassApi against the Spring backend (ROAMPASS_SERVER).
 *
 * - Runs only on the Next.js server: BACKEND_URL is a private env var and this module is
 *   `server-only` (docs/decisions.md #3). The browser never sees these requests, so CORS does not apply.
 * - Identity goes in X-User-Id / X-Admin-Id (backend `AuthHeaders`), never in the URL.
 * - Every non-2xx response is thrown as ApiError with the backend's ProblemDetail (`code` included).
 *   Reads that may legitimately miss (404 ORDER_NOT_FOUND, also used for another user's order)
 *   are exposed as `null` by the interface so pages can call notFound().
 * - fetch uses the default cache mode ("auto no cache"): fresh on every request unless the caller
 *   wraps it in `'use cache'` (only the plan list does, docs/decisions.md #10). Setting
 *   `cache: 'no-store'` here would conflict with that directive.
 * - A timeout turns a hanging backend into an ApiError (code BACKEND_TIMEOUT / BACKEND_UNREACHABLE)
 *   instead of a hanging render. Trade-off (docs/decisions.md #31): Next skips its per-render GET
 *   memoization for requests that carry a `signal` (next/dist/server/lib/dedupe-fetch.js), so a query
 *   needed twice in one render is wrapped in React `cache()` in features/*\/queries.ts instead.
 */

const USER_ID_HEADER = 'X-User-Id';
const ADMIN_ID_HEADER = 'X-Admin-Id';
const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
const TIMEOUT_MS = 10_000;

function baseUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) throw new Error('BACKEND_URL is not set (see .env.example)');
  return url.replace(/\/+$/, '');
}

type Query = Record<string, string | number | undefined>;

function withQuery(path: string, query?: Query): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
  query?: Query;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${baseUrl()}${withQuery(path, options.query)}`;
  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    const timedOut = cause instanceof Error && cause.name === 'TimeoutError';
    throw new ApiError({
      status: 503,
      code: timedOut ? 'BACKEND_TIMEOUT' : 'BACKEND_UNREACHABLE',
      detail: timedOut ? `No response from the backend within ${TIMEOUT_MS}ms` : `Could not reach the backend: ${String(cause)}`,
    });
  }

  if (!response.ok) throw new ApiError(await readProblem(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function readProblem(response: Response): Promise<ProblemDetail> {
  const fallback: ProblemDetail = { status: response.status, code: `HTTP_${response.status}`, detail: response.statusText };
  try {
    const body = (await response.json()) as Partial<ProblemDetail>;
    return { ...fallback, ...body, status: response.status, code: body.code ?? fallback.code };
  } catch {
    return fallback;
  }
}

/** Turns the backend's 404 for "missing or not yours" into null; other errors pass through. */
async function orNull<T>(call: Promise<T>): Promise<T | null> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

const asUser = (userId: string) => ({ [USER_ID_HEADER]: userId });
const asAdmin = (adminId: string) => ({ [ADMIN_ID_HEADER]: adminId });

export const httpApi = {
  // Plans (no identity header)
  listPlans(filter: PlanFilter = {}): Promise<Plan[]> {
    return request<Plan[]>('/api/plans', { query: filter });
  },

  // Orders & payment (X-User-Id)
  /**
   * idempotencyKey: created once when the order form renders (docs/decisions.md #6), so a resubmit after a
   * lost response or a server restart returns the same order instead of creating a second one.
   */
  createOrder(userId: string, input: CreateOrderRequest, idempotencyKey: string): Promise<Order> {
    return request<Order>('/api/orders', {
      method: 'POST',
      headers: { ...asUser(userId), [IDEMPOTENCY_KEY_HEADER]: idempotencyKey },
      body: input,
    });
  },
  getOrder(userId: string, orderNo: OrderNo): Promise<Order | null> {
    return orNull(request<Order>(`/api/orders/${encodeURIComponent(orderNo)}`, { headers: asUser(userId) }));
  },
  payOrder(userId: string, orderNo: OrderNo): Promise<PayResult> {
    return request<PayResult>(`/api/orders/${encodeURIComponent(orderNo)}/pay`, { method: 'POST', headers: asUser(userId) });
  },
  requestRefund(userId: string, orderNo: OrderNo): Promise<RefundResult> {
    return request<RefundResult>(`/api/orders/${encodeURIComponent(orderNo)}/refund`, {
      method: 'POST',
      headers: asUser(userId),
    });
  },

  // My SIMs (X-User-Id)
  listMySims(userId: string, page = 0, size = 20): Promise<Page<MySimSummary>> {
    return request<Page<MySimSummary>>('/api/sims', { headers: asUser(userId), query: { page, size } });
  },
  getMySim(userId: string, orderNo: OrderNo): Promise<MySimDetail | null> {
    return orNull(request<MySimDetail>(`/api/sims/${encodeURIComponent(orderNo)}`, { headers: asUser(userId) }));
  },
  markQrViewed(userId: string, orderNo: OrderNo): Promise<void> {
    return request<void>(`/api/sims/${encodeURIComponent(orderNo)}/qr-viewed`, { method: 'POST', headers: asUser(userId) });
  },
  registerUsimIccid(userId: string, orderNo: OrderNo, iccid: string): Promise<UsimRegistrationResult> {
    return request<UsimRegistrationResult>(`/api/orders/${encodeURIComponent(orderNo)}/usim/register`, {
      method: 'POST',
      headers: asUser(userId),
      body: { iccid },
    });
  },

  // Admin (X-Admin-Id)
  listAdminOrders(adminId: string, filter: AdminOrderFilter = {}): Promise<WithAsOf<Page<AdminOrderSummary>>> {
    return request<WithAsOf<Page<AdminOrderSummary>>>('/admin/orders', { headers: asAdmin(adminId), query: filter });
  },
  getAdminOrder(adminId: string, orderNo: OrderNo): Promise<WithAsOf<AdminOrderDetail> | null> {
    return orNull(
      request<WithAsOf<AdminOrderDetail>>(`/admin/orders/${encodeURIComponent(orderNo)}`, { headers: asAdmin(adminId) }),
    );
  },
  listAdminIssues(adminId: string): Promise<WithAsOf<AdminIssues>> {
    return request<WithAsOf<AdminIssues>>('/admin/issues', { headers: asAdmin(adminId) });
  },
  refundOrder(adminId: string, orderNo: OrderNo, body: OperatorActionRequest): Promise<WithAsOf<OperatorActionResult>> {
    return request<WithAsOf<OperatorActionResult>>(`/admin/orders/${encodeURIComponent(orderNo)}/refund`, {
      method: 'POST',
      headers: asAdmin(adminId),
      body,
    });
  },
  reissueOrder(adminId: string, orderNo: OrderNo, body: OperatorActionRequest): Promise<WithAsOf<OperatorActionResult>> {
    return request<WithAsOf<OperatorActionResult>>(`/admin/orders/${encodeURIComponent(orderNo)}/reissue`, {
      method: 'POST',
      headers: asAdmin(adminId),
      body,
    });
  },
};
