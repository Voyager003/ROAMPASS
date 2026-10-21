import { describe, expect, it } from 'vitest';

import { addMonths, addYears, compareYearMonth, isWithin, monthGrid } from './calendar';

describe('여행 시작일 달력 계산', () => {
  it('builds_sunday_first_weeks_with_blanks', () => {
    const weeks = monthGrid({ year: 2026, month: 10 });
    // 2026-10-01 is a Thursday.
    expect(weeks[0]).toEqual([null, null, null, null, '2026-10-01', '2026-10-02', '2026-10-03']);
    expect(weeks.at(-1)).toEqual(['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31']);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it('moves_across_year_boundaries', () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(compareYearMonth({ year: 2027, month: 1 }, { year: 2026, month: 12 })).toBeGreaterThan(0);
  });

  it('adds_a_year_keeping_feb_29_valid', () => {
    expect(addYears('2026-10-21', 1)).toBe('2027-10-21');
    expect(addYears('2028-02-29', 1)).toBe('2029-02-28');
  });

  it('checks_inclusive_range_as_text', () => {
    expect(isWithin('2026-10-21', '2026-10-21', '2027-10-21')).toBe(true);
    expect(isWithin('2026-10-20', '2026-10-21', '2027-10-21')).toBe(false);
    expect(isWithin('2027-10-22', '2026-10-21', '2027-10-21')).toBe(false);
  });
});
