import Link from 'next/link';
import type { ReactNode } from 'react';

import { InstallStatusBadge, OrderStatusBadge, PaymentStatusBadge } from '@/components/status-badges';
import { Table, Td, Th } from '@/components/ui/table';
import type { AdminOrderSummary } from '@/lib/api/types';
import { formatKstDateTime } from '@/lib/format/kst';
import { SIM_TYPE_LABELS } from '@/lib/format/labels';
import { formatMoney } from '@/lib/format/money';

/** Optional first column (e.g. which group a row belongs to on the pending-work screen). */
export type LeadingColumn<T> = { header: string; cell: (row: T) => ReactNode };

/** Admin order rows (list and pending-work screens); the order number links to the detail page. */
export function OrderTable({ orders, leading }: { orders: AdminOrderSummary[]; leading?: LeadingColumn<AdminOrderSummary> }) {
  return (
    <Table>
      <thead>
        <tr>
          {leading && <Th>{leading.header}</Th>}
          <Th>주문번호</Th>
          <Th>사용자</Th>
          <Th>SIM</Th>
          <Th className="text-right">금액</Th>
          <Th>주문 상태</Th>
          <Th>결제 상태</Th>
          <Th>설치 상태</Th>
          <Th>생성(KST)</Th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.orderNo}>
            {leading && <Td>{leading.cell(order)}</Td>}
            <Td>
              <Link
                href={`/admin/orders/${encodeURIComponent(order.orderNo)}`}
                className="font-medium text-fg-brand hover:underline"
              >
                {order.orderNo}
              </Link>
            </Td>
            <Td>{order.userId}</Td>
            <Td>{SIM_TYPE_LABELS[order.simType]}</Td>
            <Td className="text-right">{formatMoney(order.amount)}</Td>
            <Td>
              <OrderStatusBadge status={order.orderStatus} />
            </Td>
            <Td>{order.paymentStatus ? <PaymentStatusBadge status={order.paymentStatus} /> : <Dash />}</Td>
            <Td>{order.installStatus ? <InstallStatusBadge status={order.installStatus} /> : <Dash />}</Td>
            <Td>{formatKstDateTime(order.createdAt)}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function Dash() {
  return <span className="text-fg-subtle">-</span>;
}
