import { Suspense } from 'react';

import { PageHeader } from '@/components/ui/page-header';
import { IssueList, IssueListSkeleton } from '@/features/admin/components/issue-list';

/**
 * "처리 대기": orders and notifications automatic processing could not finish (backend GET /admin/issues).
 * The header is static; the groups depend on searchParams and stream under <Suspense>.
 */
export default function AdminIssuesPage({ searchParams }: PageProps<'/admin/issues'>) {
  return (
    <>
      <PageHeader title="처리 대기" description="자동 처리로 끝나지 않아 운영자가 확인하거나 조치해야 하는 건이에요." />
      <Suspense fallback={<IssueListSkeleton />}>
        <IssueList searchParams={searchParams} />
      </Suspense>
    </>
  );
}
