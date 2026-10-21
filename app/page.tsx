import { Suspense } from 'react';

import { IdentityChip } from '@/components/identity-chip';

// Placeholder until the user shell (F0-6) and the home screen (F1-1). Shows the demo identity chip.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <h1 className="text-xl font-bold text-fg">ROAMPASS</h1>
      <p className="mt-2 text-sm text-fg-muted">여행용 이심·유심 데이터 요금제 (준비 중)</p>
      <div className="mt-6 flex gap-6">
        <Suspense fallback={null}>
          <IdentityChip role="user" />
        </Suspense>
        <Suspense fallback={null}>
          <IdentityChip role="admin" />
        </Suspense>
      </div>
    </main>
  );
}
