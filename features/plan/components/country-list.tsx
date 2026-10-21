import Link from 'next/link';

import { ApiError } from '@/lib/api/errors';
import type { Plan } from '@/lib/api/types';
import { formatCountry, SIM_TYPE_LABELS } from '@/lib/format/labels';
import { formatMoney } from '@/lib/format/money';

import { summarizeCountries } from '../catalog';
import { getPlans } from '../queries';

/** Country cards of the home screen: name, "단 N원부터", SIM types and day options. */
export async function CountryList() {
  let plans: Plan[];
  try {
    plans = await getPlans();
  } catch (error) {
    if (error instanceof ApiError) {
      return (
        <p role="alert" className="rounded-card bg-layer px-5 py-6 text-[15px] text-fg-critical">
          요금제를 불러오지 못했어요. 잠시 후 다시 시도해 주세요. ({error.code})
        </p>
      );
    }
    throw error;
  }

  const countries = summarizeCountries(plans);
  if (countries.length === 0) {
    return <p className="rounded-card bg-layer px-5 py-6 text-[15px] text-fg-muted">판매 중인 요금제가 없어요.</p>;
  }

  return (
    <ul className="grid gap-3">
      {countries.map((c) => (
        <li key={c.countryCode}>
          <Link
            href={`/plans/${c.countryCode}`}
            className="flex items-center gap-4 rounded-card bg-layer px-5 py-4 transition-colors hover:bg-weak"
          >
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--seed-color-bg-brand-weak)] text-sm font-bold text-fg-brand"
            >
              {c.countryCode}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-bold text-fg">{formatCountry(c.countryCode)}</span>
              <span className="mt-0.5 block text-[13px] text-fg-muted">
                {c.simTypes.map((t) => SIM_TYPE_LABELS[t]).join(' · ')} · {c.days.map((d) => `${d}일`).join(' / ')}
              </span>
            </span>
            <span className="text-right text-[13px] text-fg-muted">
              단 <strong className="text-[17px] font-bold text-fg tabular-nums">{formatMoney(c.minPrice)}</strong>
              <br />
              부터
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Placeholder shown in the prerendered shell while the plan list is read. */
export function CountryListSkeleton() {
  return (
    <ul className="grid gap-3" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="h-[76px] animate-pulse rounded-card bg-layer" />
      ))}
    </ul>
  );
}
