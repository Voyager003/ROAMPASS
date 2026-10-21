import type { InstallStatus, IssueType, OrderStatus, PaymentStatus, RefundStatus } from '@/lib/api/types';
import {
  INSTALL_STATUS_LABELS,
  ISSUE_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  REFUND_STATUS_LABELS,
} from '@/lib/format/labels';

import { Badge } from './ui/badge';

// One badge per status family so screens never map statuses inline (CLAUDE.md §1).

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, tone } = ORDER_STATUS_LABELS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, tone } = PAYMENT_STATUS_LABELS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function InstallStatusBadge({ status }: { status: InstallStatus }) {
  const { label, tone } = INSTALL_STATUS_LABELS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function RefundStatusBadge({ status }: { status: RefundStatus }) {
  const { label, tone } = REFUND_STATUS_LABELS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function IssueTypeBadge({ type }: { type: IssueType }) {
  const { label, tone } = ISSUE_TYPE_LABELS[type];
  return <Badge tone={tone}>{label}</Badge>;
}
