import type { Money, Plan, SimType } from '@/lib/api/types';

/**
 * Pure helpers over the plan list (GET /api/plans). The backend has no single-plan or per-country
 * endpoint, so screens narrow the cached list here (docs/decisions.md #26, #35). No runtime
 * dependencies: shared by Server and Client Components and unit-tested (catalog.test.ts).
 */

export type CountrySummary = {
  countryCode: string;
  /** Cheapest plan price in the country ("단 N원부터"). */
  minPrice: Money;
  simTypes: SimType[];
  /** Usage days offered in the country, ascending. */
  days: number[];
};

/** One summary per country, in the order countries first appear in the list (backend seed order). */
export function summarizeCountries(plans: readonly Plan[]): CountrySummary[] {
  const byCountry = new Map<string, Plan[]>();
  for (const plan of plans) {
    const list = byCountry.get(plan.countryCode) ?? [];
    list.push(plan);
    byCountry.set(plan.countryCode, list);
  }
  return [...byCountry.entries()].map(([countryCode, list]) => ({
    countryCode,
    minPrice: cheapest(list).price,
    simTypes: unique(list.map((p) => p.simType)).sort(),
    days: unique(list.map((p) => p.days)).sort((a, b) => a - b),
  }));
}

export function plansOfCountry(plans: readonly Plan[], countryCode: string): Plan[] {
  return plans.filter((p) => p.countryCode === countryCode);
}

/** Lowest-priced plan. Prices of one country share a currency (backend seed is KRW only). */
export function cheapest(plans: readonly Plan[]): Plan {
  if (plans.length === 0) throw new Error('cheapest() needs at least one plan');
  return plans.reduce((min, p) => (p.price.amount < min.price.amount ? p : min));
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
