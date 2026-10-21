import { describe, expect, it } from 'vitest';

import { formatCountdown } from './countdown';

describe('결제 기한 카운트다운', () => {
  it('formats_minutes_and_seconds', () => {
    expect(formatCountdown(10 * 60_000)).toBe('10:00');
    expect(formatCountdown(65_000)).toBe('01:05');
  });

  it('rounds_partial_seconds_up_so_zero_means_expired', () => {
    expect(formatCountdown(500)).toBe('00:01');
    expect(formatCountdown(0)).toBe('00:00');
  });

  it('never_goes_negative', () => {
    expect(formatCountdown(-3_000)).toBe('00:00');
  });
});
