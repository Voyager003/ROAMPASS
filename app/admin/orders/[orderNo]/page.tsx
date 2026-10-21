import Link from 'next/link';
import { Suspense } from 'react';

import { OrderDetail, OrderDetailSkeleton } from '@/features/admin/components/order-detail';

/** Admin order detail and operator actions; the body reads the backend at request time. */
export default function AdminOrderPage({ params }: PageProps<'/admin/orders/[orderNo]'>) {
  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-block text-[14px] text-fg-muted hover:text-fg">
        ← 주문 목록
      </Link>
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetail params={params} />
      </Suspense>
    </>
  );
}
