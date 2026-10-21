'use client';

import { cn } from '@/lib/cn';

export type ChoiceOption = { value: string; label: string; disabled?: boolean };

/**
 * Single-choice chips laid out in a grid (usage days, data, SIM type): white with a light border,
 * black when selected, as in the demo video (docs/decisions.md #32). Native radio inputs, so keyboard
 * and screen readers get radio-group behaviour for free. Controlled by the parent Client Component.
 */
export function ChoiceChips({
  name,
  legend,
  options,
  value,
  onValueChange,
  columns = 5,
}: {
  name: string;
  /** Accessible name of the group (the visible title is the SectionTitle above). */
  legend: string;
  options: readonly ChoiceOption[];
  value: string | null;
  onValueChange?: (value: string) => void;
  columns?: 2 | 3 | 4 | 5;
}) {
  const grid = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5' }[columns];
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className={cn('grid gap-2', grid)}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex h-12 cursor-pointer items-center justify-center rounded-lg border text-[15px] font-medium transition-colors',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--seed-color-stroke-focus-ring)]',
                checked ? 'border-transparent bg-inverted text-fg-inverted' : 'border-line bg-layer text-fg',
                option.disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                onChange={() => onValueChange?.(option.value)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
