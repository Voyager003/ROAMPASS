import type { LocalDate } from '@/lib/api/types';

/**
 * Calendar math on "YYYY-MM-DD" strings (KST calendar dates, never converted through a time zone).
 * Arithmetic goes through Date.UTC so the process time zone cannot shift a day. Unit-tested.
 */

export type YearMonth = { year: number; month: number };

const pad = (n: number) => String(n).padStart(2, '0');

export function toLocalDate(year: number, month: number, day: number): LocalDate {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseLocalDate(date: LocalDate): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Same calendar date one or more years later; Feb 29 becomes Feb 28 in a non-leap year. */
export function addYears(date: LocalDate, years: number): LocalDate {
  const { year, month, day } = parseLocalDate(date);
  const target = year + years;
  return toLocalDate(target, month, Math.min(day, daysInMonth(target, month)));
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

export function yearMonthOf(date: LocalDate): YearMonth {
  const { year, month } = parseLocalDate(date);
  return { year, month };
}

/** "YYYY-MM-DD" compares correctly as text. */
export function isWithin(date: LocalDate, min: LocalDate, max: LocalDate): boolean {
  return date >= min && date <= max;
}

/**
 * Weeks of a month, Sunday first; days outside the month are null.
 * e.g. October 2026 starts on a Thursday → first week [null, null, null, null, '2026-10-01', …].
 */
export function monthGrid({ year, month }: YearMonth): (LocalDate | null)[][] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const cells: (LocalDate | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth(year, month); day++) cells.push(toLocalDate(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (LocalDate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
