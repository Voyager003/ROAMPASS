import { Suspense } from 'react';

import { ScreenHeader } from '@/components/shell/screen-header';
import { OrderScreen, OrderScreenSkeleton } from '@/features/order/components/order-screen';

/**
 * One order's page: payment, then (F1-5) issuance waiting / pickup. The body reads the order at
 * request time, so it streams under <Suspense> behind a static header.
 */
export default function OrderPage({ params }: PageProps<'/orders/[orderNo]'>) {
  return (
    <>
      <ScreenHeader title="주문·결제" backHref="/" />
      <Suspense fallback={<OrderScreenSkeleton />}>
        <OrderScreen params={params} />
      </Suspense>
    </>
  );
}
