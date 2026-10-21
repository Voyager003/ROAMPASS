import { describe, expect, it } from 'vitest';

import { parsePendingFilter, pendingHref } from './pending';

describe('처리 대기 묶음 필터', () => {
  it('keeps_known_group_and_falls_back_to_all', () => {
    expect(parsePendingFilter('NEEDS_ATTENTION')).toBe('NEEDS_ATTENTION');
    expect(parsePendingFilter('NOPE')).toBe('ALL');
    expect(parsePendingFilter(undefined)).toBe('ALL');
  });

  it('builds_urls', () => {
    expect(pendingHref('ALL')).toBe('/admin/issues');
    expect(pendingHref('AMOUNT_MISMATCH')).toBe('/admin/issues?type=AMOUNT_MISMATCH');
  });
});
