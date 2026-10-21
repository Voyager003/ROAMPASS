import { Suspense } from 'react';

import { ScreenHeader } from '@/components/shell/screen-header';
import { ConfigureScreen, ConfigureScreenSkeleton } from '@/features/plan/components/configure-screen';

/**
 * Configure & order screen of one country (docs/decisions.md #32). The header is static; the body
 * depends on params and the plan list, so it streams under <Suspense>.
 */
export default function PlanPage({ params }: PageProps<'/plans/[country]'>) {
  return (
    <>
      <ScreenHeader title="데이터 SIM 구매" backHref="/" />
      <Suspense fallback={<ConfigureScreenSkeleton />}>
        <ConfigureScreen params={params} />
      </Suspense>
    </>
  );
}
