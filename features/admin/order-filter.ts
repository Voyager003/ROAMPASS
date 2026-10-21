import {
  type AdminOrderFilter,
  INSTALL_STATUSES,
  type LocalDate,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SIM_TYPES,
} from '@/lib/api/types';

/**
 * The admin order list keeps its filter in the URL (`searchParams`), so a filtered view can be
 * reloaded, shared and paged with plain links (assignment §2.3-⑤). This module turns the raw query
 * into the backend filter and back. Unknown values are dropped rather than sent: the backend would
 * answer 400 for a bad enum, and an operator typing in the URL should still get a list.
 */

export const PAGE_SIZES = [20, 50] as const;
const DEFAULT_PAGE_SIZE = 20;
const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

type RawQuery = Record<string, string | string[] | undefined>;

/** What the filter form shows; dates are KST calendar dates ("YYYY-MM-DD"), end date inclusive. */
export type AdminOrderQuery = {
  status?: AdminOrderFilter['status'];
  paymentStatus?: AdminOrderFilter['paymentStatus'];
  installStatus?: AdminOrderFilter['installStatus'];
  simType?: AdminOrderFilter['simType'];
  fromDate?: LocalDate;
  toDate?: LocalDate;
  page: number;
  size: number;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(allowed: readonly T[], value: string | undefined): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

function localDate(value: string | undefined): LocalDate | undefined {
  return value && LOCAL_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ? value : undefined;
}

export function parseAdminOrderQuery(raw: RawQuery): AdminOrderQuery {
  const page = Number(first(raw.page));
  const size = Number(first(raw.size));
  return {
    status: oneOf(ORDER_STATUSES, first(raw.status)),
    paymentStatus: oneOf(PAYMENT_STATUSES, first(raw.paymentStatus)),
    installStatus: oneOf(INSTALL_STATUSES, first(raw.installStatus)),
    simType: oneOf(SIM_TYPES, first(raw.simType)),
    fromDate: localDate(first(raw.from)),
    toDate: localDate(first(raw.to)),
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    size: (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE,
  };
}

/** Start of a KST calendar day as a UTC instant. */
export function kstStartOfDay(date: LocalDate): string {
  return new Date(`${date}T00:00:00+09:00`).toISOString();
}

/** Start of the KST day after `date`, as a UTC instant (the backend's `to` is exclusive). */
export function kstStartOfNextDay(date: LocalDate): string {
  return new Date(Date.parse(`${date}T00:00:00+09:00`) + 24 * 60 * 60 * 1000).toISOString();
}

/** Form values → backend filter (`from` inclusive, `to` exclusive, both UTC instants). */
export function toAdminOrderFilter(query: AdminOrderQuery): AdminOrderFilter {
  return {
    status: query.status,
    paymentStatus: query.paymentStatus,
    installStatus: query.installStatus,
    simType: query.simType,
    from: query.fromDate ? kstStartOfDay(query.fromDate) : undefined,
    to: query.toDate ? kstStartOfNextDay(query.toDate) : undefined,
    page: query.page,
    size: query.size,
  };
}

/** URL of the list with the same filter and another page (empty values left out). */
export function adminOrdersHref(query: AdminOrderQuery, page: number): string {
  const params = new URLSearchParams();
  const entries: [string, string | number | undefined][] = [
    ['status', query.status],
    ['paymentStatus', query.paymentStatus],
    ['installStatus', query.installStatus],
    ['simType', query.simType],
    ['from', query.fromDate],
    ['to', query.toDate],
    ['size', query.size === DEFAULT_PAGE_SIZE ? undefined : query.size],
    ['page', page === 0 ? undefined : page],
  ];
  for (const [key, value] of entries) if (value !== undefined) params.set(key, String(value));
  const qs = params.toString();
  return qs ? `/admin/orders?${qs}` : '/admin/orders';
}

/** Number of pages for a total (at least 1, so "1 / 1" shows for an empty list). */
export function pageCount(totalElements: number, size: number): number {
  return Math.max(1, Math.ceil(totalElements / size));
}
