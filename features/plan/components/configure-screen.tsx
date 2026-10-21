import { notFound } from 'next/navigation';

import { createOrderAction } from '@/features/order/actions';
import { ApiError } from '@/lib/api/errors';
import type { Plan } from '@/lib/api/types';
import { kstDateOf } from '@/lib/format/kst';
import { formatCountry } from '@/lib/format/labels';

import { addYears } from '../calendar';
import { cheapest, plansOfCountry } from '../catalog';
import { getPlans } from '../queries';
import { PlanConfigurator } from './plan-configurator';

/**
 * Server part of /plans/[country]: resolves the country's plans and today's KST date, then hands
 * them to the Client Component. Unknown country → 404. Rendered under <Suspense> (params and the
 * plan list are request-time data).
 */
export async function ConfigureScreen({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const countryCode = country.toUpperCase();

  let all: Plan[];
  try {
    all = await getPlans();
  } catch (error) {
    if (error instanceof ApiError) {
      return (
        <p role="alert" className="m-5 rounded-card bg-layer px-5 py-6 text-[15px] text-fg-critical">
          요금제를 불러오지 못했어요. 잠시 후 다시 시도해 주세요. ({error.code})
        </p>
      );
    }
    throw error;
  }

  const plans = plansOfCountry(all, countryCode);
  if (plans.length === 0) notFound();

  // After getPlans() (connection()), so "today" and the key belong to this request, not the build.
  const today = kstDateOf(new Date());
  // One key per rendered order form: a resubmit of this form is the same attempt (docs/decisions.md #6).
  const idempotencyKey = crypto.randomUUID();
  return (
    <PlanConfigurator
      countryName={formatCountry(countryCode)}
      plans={plans}
      minPrice={cheapest(plans).price}
      today={today}
      maxDate={addYears(today, 1)}
      orderAction={createOrderAction}
      idempotencyKey={idempotencyKey}
    />
  );
}

export function ConfigureScreenSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <div className="h-40 animate-pulse bg-brand/70" />
      <div className="h-44 animate-pulse bg-layer" />
      <div className="h-96 animate-pulse bg-layer" />
    </div>
  );
}
