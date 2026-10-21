import { describe, expect, it } from 'vitest';

import {
  formatAge,
  formatKstDate,
  formatKstDateTime,
  formatKstLocalDateTime,
  formatLocalDate,
  formatRemaining,
  formatRemainingMs,
  kstDateOf,
} from './kst';

describe('KST 날짜·시각 표시', () => {
  it('formats_utc_instant_in_kst_crossing_midnight', () => {
    // Appendix A example: 15:20 UTC is 00:20 the next day in KST.
    expect(formatKstDateTime('2026-05-01T15:20:00Z')).toBe('2026.05.02 00:20');
    expect(formatKstDate('2026-05-01T15:20:00Z')).toBe('2026.05.02');
    expect(kstDateOf('2026-05-01T15:20:00Z')).toBe('2026-05-02');
  });

  it('keeps_same_date_just_before_kst_midnight', () => {
    expect(formatKstDateTime('2026-05-01T14:59:00Z')).toBe('2026.05.01 23:59');
    expect(kstDateOf('2026-05-01T14:59:59Z')).toBe('2026-05-01');
  });

  it('formats_midnight_as_00_not_24', () => {
    expect(formatKstDateTime('2026-05-01T15:00:00Z')).toBe('2026.05.02 00:00');
  });

  it('formats_local_date_without_time_zone_conversion', () => {
    expect(formatLocalDate('2026-05-02')).toBe('2026.05.02');
  });

  it('shows_backend_kst_local_date_time_as_given', () => {
    // Appendix A example: activated 2026-05-01T15:20Z, 7 days → expiresAtKst 2026-05-09T00:20:00.
    expect(formatKstLocalDateTime('2026-05-09T00:20:00')).toBe('2026.05.09 00:20');
  });
});

describe('남은 기간', () => {
  const now = new Date('2026-05-01T00:00:00Z');

  it('shows_days_and_hours_when_more_than_a_day_left', () => {
    expect(formatRemaining('2026-05-04T04:30:00Z', now)).toBe('3일 4시간 남음');
  });

  it('shows_hours_and_minutes_within_a_day', () => {
    expect(formatRemaining('2026-05-01T02:10:00Z', now)).toBe('2시간 10분 남음');
  });

  it('shows_under_a_minute_and_expired', () => {
    expect(formatRemaining('2026-05-01T00:00:30Z', now)).toBe('1분 미만 남음');
    expect(formatRemaining('2026-05-01T00:00:00Z', now)).toBe('만료됨');
    expect(formatRemaining('2026-04-30T00:00:00Z', now)).toBe('만료됨');
  });
});

describe('어드민 데이터 시점', () => {
  const now = new Date('2026-05-01T00:10:00Z');

  it('shows_seconds_minutes_hours_ago', () => {
    expect(formatAge('2026-05-01T00:09:57Z', now)).toBe('3초 전');
    expect(formatAge('2026-05-01T00:08:00Z', now)).toBe('2분 전');
    expect(formatAge('2026-04-30T23:00:00Z', now)).toBe('1시간 전');
  });

  it('never_shows_negative_age_when_clocks_skew', () => {
    expect(formatAge('2026-05-01T00:10:05Z', now)).toBe('0초 전');
  });
});

describe('남은 시간(초 단위 입력)', () => {
  it('formats_backend_remaining_seconds', () => {
    expect(formatRemainingMs((3 * 24 * 3600 + 4 * 3600) * 1000)).toBe('3일 4시간 남음');
    expect(formatRemainingMs(0)).toBe('만료됨');
  });
});
