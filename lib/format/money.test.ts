import { describe, expect, it } from 'vitest';

import { formatDataMb, formatMoney } from './money';

describe('금액 표시', () => {
  it('formats_krw_with_grouping_and_won', () => {
    expect(formatMoney({ amount: 12_900, currency: 'KRW' })).toBe('12,900원');
    expect(formatMoney({ amount: 0, currency: 'KRW' })).toBe('0원');
  });

  it('formats_usd_from_cents', () => {
    expect(formatMoney({ amount: 1_234, currency: 'USD' })).toBe('$12.34');
  });
});

describe('데이터 용량 표시', () => {
  it('formats_mb_and_gb', () => {
    expect(formatDataMb(500)).toBe('500MB');
    expect(formatDataMb(3_072)).toBe('3GB');
    expect(formatDataMb(1_536)).toBe('1.5GB');
  });
});
