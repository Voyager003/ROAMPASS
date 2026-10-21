import { describe, expect, it } from 'vitest';

import type { Plan } from '@/lib/api/types';

import { cheapest, plansOfCountry, summarizeCountries } from './catalog';

const plan = (planId: number, countryCode: string, days: number, dataMb: number, simType: Plan['simType'], amount: number): Plan => ({
  planId,
  countryCode,
  days,
  dataMb,
  simType,
  price: { amount, currency: 'KRW' },
});

// Shape of the backend seed (V2): two day/data combinations per country and SIM type.
const PLANS: Plan[] = [
  plan(1, 'JP', 5, 3072, 'ESIM', 9900),
  plan(2, 'JP', 10, 10240, 'ESIM', 19900),
  plan(3, 'JP', 5, 3072, 'USIM', 11900),
  plan(9, 'VN', 5, 5120, 'ESIM', 6900),
  plan(11, 'VN', 5, 5120, 'USIM', 8900),
];

describe('국가별 요금제 요약', () => {
  it('summarizes_each_country_in_list_order_with_cheapest_price', () => {
    const summaries = summarizeCountries(PLANS);

    expect(summaries.map((s) => s.countryCode)).toEqual(['JP', 'VN']);
    expect(summaries[0]).toEqual({
      countryCode: 'JP',
      minPrice: { amount: 9900, currency: 'KRW' },
      simTypes: ['ESIM', 'USIM'],
      days: [5, 10],
    });
    expect(summaries[1].minPrice.amount).toBe(6900);
  });

  it('returns_empty_for_empty_list', () => {
    expect(summarizeCountries([])).toEqual([]);
  });

  it('filters_by_country_and_picks_cheapest', () => {
    expect(plansOfCountry(PLANS, 'VN').map((p) => p.planId)).toEqual([9, 11]);
    expect(cheapest(plansOfCountry(PLANS, 'JP')).planId).toBe(1);
    expect(() => cheapest([])).toThrow();
  });
});
