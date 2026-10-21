import type { Plan, SimType } from '@/lib/api/types';

/**
 * Narrowing the plans of one country with the configure screen's choices, in the demo video's order:
 * usage days → data → SIM type (docs/decisions.md #35). Only values that exist in the plan list are
 * offered. Pure functions, unit-tested (selection.test.ts).
 */
export type PlanSelection = {
  days: number | null;
  dataMb: number | null;
  simType: SimType | null;
};

export const EMPTY_SELECTION: PlanSelection = { days: null, dataMb: null, simType: null };

const sortedUnique = (values: number[]) => [...new Set(values)].sort((a, b) => a - b);

export function dayOptions(plans: readonly Plan[]): number[] {
  return sortedUnique(plans.map((p) => p.days));
}

/** Data amounts for the chosen days (all amounts until days are chosen). */
export function dataOptions(plans: readonly Plan[], days: number | null): number[] {
  return sortedUnique(plans.filter((p) => days === null || p.days === days).map((p) => p.dataMb));
}

/** SIM types for the chosen days and data. */
export function simOptions(plans: readonly Plan[], days: number | null, dataMb: number | null): SimType[] {
  const types = plans
    .filter((p) => (days === null || p.days === days) && (dataMb === null || p.dataMb === dataMb))
    .map((p) => p.simType);
  return [...new Set(types)].sort();
}

/**
 * Applies one change and drops later choices that no longer exist, so the screen never holds an
 * impossible combination (e.g. switching 10 days → 5 days clears a 10GB data choice).
 */
export function applyChoice(plans: readonly Plan[], current: PlanSelection, change: Partial<PlanSelection>): PlanSelection {
  const next = { ...current, ...change };
  if (next.dataMb !== null && !dataOptions(plans, next.days).includes(next.dataMb)) next.dataMb = null;
  if (next.simType !== null && !simOptions(plans, next.days, next.dataMb).includes(next.simType)) next.simType = null;
  return next;
}

/** The single plan the choices point to, or null while the choice is incomplete. */
export function resolvePlan(plans: readonly Plan[], s: PlanSelection): Plan | null {
  if (s.days === null || s.dataMb === null || s.simType === null) return null;
  return plans.find((p) => p.days === s.days && p.dataMb === s.dataMb && p.simType === s.simType) ?? null;
}
