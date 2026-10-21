import { describe, expect, it } from 'vitest';

import {
  adminOrdersHref,
  kstStartOfDay,
  kstStartOfNextDay,
  pageCount,
  parseAdminOrderQuery,
  toAdminOrderFilter,
} from './order-filter';

describe('어드민 주문 목록 필터', () => {
  it('keeps_known_values_and_drops_unknown_ones', () => {
    const query = parseAdminOrderQuery({ status: 'PAID', paymentStatus: 'NOPE', installStatus: 'EXPIRED', simType: 'ESIM' });
    expect(query).toMatchObject({ status: 'PAID', installStatus: 'EXPIRED', simType: 'ESIM' });
    expect(query.paymentStatus).toBeUndefined();
  });

  it('falls_back_to_first_page_and_default_size', () => {
    expect(parseAdminOrderQuery({ page: '-1', size: '999' })).toMatchObject({ page: 0, size: 20 });
    expect(parseAdminOrderQuery({ page: '2', size: '50' })).toMatchObject({ page: 2, size: 50 });
  });

  it('drops_malformed_dates', () => {
    expect(parseAdminOrderQuery({ from: '2026/10/01', to: '2026-13-40' })).toMatchObject({
      fromDate: undefined,
      toDate: undefined,
    });
  });

  it('turns_kst_dates_into_utc_range_with_exclusive_end', () => {
    expect(kstStartOfDay('2026-10-21')).toBe('2026-10-20T15:00:00.000Z');
    expect(kstStartOfNextDay('2026-10-21')).toBe('2026-10-21T15:00:00.000Z');
    expect(kstStartOfNextDay('2026-12-31')).toBe('2026-12-31T15:00:00.000Z');
    const filter = toAdminOrderFilter(parseAdminOrderQuery({ from: '2026-10-21', to: '2026-10-21' }));
    expect(filter).toMatchObject({ from: '2026-10-20T15:00:00.000Z', to: '2026-10-21T15:00:00.000Z' });
  });

  it('builds_page_links_that_keep_the_filter', () => {
    const query = parseAdminOrderQuery({ status: 'ISSUED', size: '50' });
    expect(adminOrdersHref(query, 1)).toBe('/admin/orders?status=ISSUED&size=50&page=1');
    expect(adminOrdersHref(parseAdminOrderQuery({}), 0)).toBe('/admin/orders');
  });

  it('counts_pages', () => {
    expect(pageCount(0, 20)).toBe(1);
    expect(pageCount(41, 20)).toBe(3);
  });
});
