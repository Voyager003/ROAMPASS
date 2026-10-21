import { Suspense } from 'react';

import { PageHeader } from '@/components/ui/page-header';
import { IssueList, IssueListSkeleton } from '@/features/admin/components/issue-list';

/** Admin issues: the header is static; the groups are read at request time and stream under <Suspense>. */
export default function AdminIssuesPage() {
  return (
    <>
      <PageHeader title="이상 건" description="결제 후 미발급, 운영자 확인 필요, 결제 금액 불일치, 서명 불일치를 모아 봐요." />
      <Suspense fallback={<IssueListSkeleton />}>
        <IssueList />
      </Suspense>
    </>
  );
}
