import { Suspense } from 'react';

import { SimList, SimListSkeleton } from '@/features/sim/components/sim-list';

/** My SIMs tab: the list depends on the user cookie and searchParams, so it streams under <Suspense>. */
export default function MySimsPage({ searchParams }: PageProps<'/my/sims'>) {
  return (
    <>
      <h1 className="px-5 pt-4 text-[20px] font-bold text-fg">내 SIM</h1>
      <Suspense fallback={<SimListSkeleton />}>
        <SimList searchParams={searchParams} />
      </Suspense>
    </>
  );
}
