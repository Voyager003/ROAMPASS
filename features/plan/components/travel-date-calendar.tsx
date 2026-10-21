'use client';

import { useState } from 'react';

import type { LocalDate } from '@/lib/api/types';
import { cn } from '@/lib/cn';

import { addMonths, compareYearMonth, isWithin, monthGrid, parseLocalDate, yearMonthOf } from '../calendar';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * Month calendar for the travel start date: one date only (docs/decisions.md #34), selectable from
 * KST today to one year later (backend rule). Our own component instead of SEED DatePicker: its month
 * header opens a year/month wheel that needs a separate WheelPicker adapter (docs/decisions.md #41).
 */
export function TravelDateCalendar({
  min,
  max,
  value,
  onValueChange,
}: {
  min: LocalDate;
  max: LocalDate;
  value: LocalDate | null;
  onValueChange: (date: LocalDate) => void;
}) {
  const [view, setView] = useState(() => yearMonthOf(value ?? min));
  const first = yearMonthOf(min);
  const last = yearMonthOf(max);
  const canPrev = compareYearMonth(view, first) > 0;
  const canNext = compareYearMonth(view, last) < 0;

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="mb-3 flex items-center justify-center gap-6">
        <button type="button" aria-label="이전 달" disabled={!canPrev} onClick={() => setView(addMonths(view, -1))} className="px-2 text-fg disabled:text-fg-subtle/40">
          ‹
        </button>
        <p className="min-w-[7.5rem] text-center text-[17px] font-bold tabular-nums" aria-live="polite">
          {view.year}년 {view.month}월
        </p>
        <button type="button" aria-label="다음 달" disabled={!canNext} onClick={() => setView(addMonths(view, 1))} className="px-2 text-fg disabled:text-fg-subtle/40">
          ›
        </button>
      </div>
      <table className="w-full table-fixed text-center text-[15px] tabular-nums">
        <thead>
          <tr>
            {WEEKDAYS.map((d, i) => (
              <th key={d} scope="col" className={cn('pb-2 text-xs font-medium', i === 0 ? 'text-fg-critical' : i === 6 ? 'text-fg-brand' : 'text-fg-muted')}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(view).map((week, wi) => (
            <tr key={wi}>
              {week.map((date, di) => {
                if (!date) return <td key={di} />;
                const selectable = isWithin(date, min, max);
                const selected = date === value;
                return (
                  <td key={date} className="py-0.5">
                    <button
                      type="button"
                      disabled={!selectable}
                      aria-pressed={selected}
                      aria-label={`${date.replaceAll('-', '.')}${selected ? ' 선택됨' : ''}`}
                      onClick={() => onValueChange(date)}
                      className={cn(
                        'mx-auto flex size-10 items-center justify-center rounded-full',
                        selected
                          ? 'bg-brand font-bold text-fg-inverted'
                          : !selectable
                            ? 'text-fg-subtle/40'
                            : di === 0
                              ? 'text-fg-critical'
                              : di === 6
                                ? 'text-fg-brand'
                                : 'text-fg',
                      )}
                    >
                      {parseLocalDate(date).day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
