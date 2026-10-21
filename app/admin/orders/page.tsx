import { Suspense } from 'react';

import { PageHeader } from '@/components/ui/page-header';
import { OrderList, OrderListSkeleton } from '@/features/admin/components/order-list';

/** Admin order list. The header is static; the list depends on searchParams and streams under <Suspense>. */
export default function AdminOrdersPage({ searchParams }: PageProps<'/admin/orders'>) {
  return (
    <>
      <PageHeader title="주문" description="주문·결제·설치 상태와 SIM 종류, 생성일로 찾을 수 있어요." />
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList searchParams={searchParams} />
      </Suspense>
    </>
  );
}
