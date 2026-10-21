import { describe, expect, it } from 'vitest';

import type { Plan } from '@/lib/api/types';

import { applyChoice, dataOptions, dayOptions, EMPTY_SELECTION, resolvePlan, simOptions } from './selection';

const plan = (planId: number, days: number, dataMb: number, simType: Plan['simType'], amount: number): Plan => ({
  planId,
  countryCode: 'JP',
  days,
  dataMb,
  simType,
  price: { amount, currency: 'KRW' },
});

// JP in the backend seed (V2).
const JP: Plan[] = [
  plan(1, 5, 3072, 'ESIM', 9900),
  plan(2, 10, 10240, 'ESIM', 19900),
  plan(3, 5, 3072, 'USIM', 11900),
  plan(4, 10, 10240, 'USIM', 21900),
];

describe('요금제 좁히기', () => {
  it('offers_only_existing_values', () => {
    expect(dayOptions(JP)).toEqual([5, 10]);
    expect(dataOptions(JP, null)).toEqual([3072, 10240]);
    expect(dataOptions(JP, 5)).toEqual([3072]);
    expect(simOptions(JP, 10, 10240)).toEqual(['ESIM', 'USIM']);
  });

  it('resolves_one_plan_only_when_all_choices_are_made', () => {
    expect(resolvePlan(JP, { days: 5, dataMb: 3072, simType: null })).toBeNull();
    expect(resolvePlan(JP, { days: 5, dataMb: 3072, simType: 'USIM' })?.planId).toBe(3);
  });

  it('drops_later_choices_that_no_longer_exist', () => {
    const chosen = { days: 10, dataMb: 10240, simType: 'ESIM' as const };
    expect(applyChoice(JP, chosen, { days: 5 })).toEqual({ days: 5, dataMb: null, simType: 'ESIM' });
  });

  it('keeps_independent_choices', () => {
    expect(applyChoice(JP, EMPTY_SELECTION, { simType: 'USIM' })).toEqual({ days: null, dataMb: null, simType: 'USIM' });
  });
});
