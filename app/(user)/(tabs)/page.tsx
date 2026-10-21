import { Suspense } from 'react';

import { CountryList, CountryListSkeleton } from '@/features/plan/components/country-list';

/**
 * Home: pick the destination country (docs/decisions.md #33). The heading is static and ships in the
 * prerendered shell; the plan list streams in under <Suspense> (request-time read, cached at runtime).
 */
export default function HomePage() {
  return (
    <div className="px-5 py-6">
      <h1 className="text-[22px] leading-snug font-bold text-fg">
        어디로 떠나세요?
        <br />
        여행 데이터를 미리 준비하세요
      </h1>
      <p className="mt-2 text-[15px] text-fg-muted">이심은 QR로 바로, 유심은 공항에서 받아요.</p>
      <div className="mt-6">
        <Suspense fallback={<CountryListSkeleton />}>
          <CountryList />
        </Suspense>
      </div>
    </div>
  );
}
