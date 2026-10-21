import { Suspense } from 'react';

import { ScreenHeader } from '@/components/shell/screen-header';
import { SimDetail, SimDetailSkeleton } from '@/features/sim/components/sim-detail';

/** One of my SIMs. A flow screen (back · title · home) like the order page; the body streams under <Suspense>. */
export default function MySimPage({ params }: PageProps<'/my/sims/[orderNo]'>) {
  return (
    <>
      <ScreenHeader title="내 SIM" backHref="/my/sims" />
      <Suspense fallback={<SimDetailSkeleton />}>
        <SimDetail params={params} />
      </Suspense>
    </>
  );
}
