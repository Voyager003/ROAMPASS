import type { AdminOrderInfo, AdminProfileInfo, OrderStatus } from '@/lib/api/types';

/**
 * Whether the operator actions can be taken right now, mirrored from the backend's
 * `AdminActionExecutor` so the screen can disable a button and say why. The backend still decides:
 * if the order changed meanwhile it answers 409 and the screen shows that instead.
 */
export type Availability = { allowed: true } | { allowed: false; reason: string };

const REFUNDABLE: ReadonlySet<OrderStatus> = new Set(['NEEDS_ATTENTION', 'PAID', 'PICKUP_READY', 'ISSUED']);

export function manualRefundAvailability(order: AdminOrderInfo, profile: AdminProfileInfo | null): Availability {
  if (!REFUNDABLE.has(order.status)) {
    return { allowed: false, reason: '결제 완료·공항 수령 대기·발급 완료·운영자 확인 필요 상태에서만 환불할 수 있어요.' };
  }
  // For ISSUED the backend re-checks the supplier first; the stored profile is the best hint here.
  if (order.status === 'ISSUED' && profile && !profile.refundable) {
    return { allowed: false, reason: '설치·개통된 SIM은 환불할 수 없어요.' };
  }
  return { allowed: true };
}

export function reissueAvailability(order: AdminOrderInfo): Availability {
  if (order.status !== 'NEEDS_ATTENTION') {
    return { allowed: false, reason: '운영자 확인 필요 상태에서만 발급을 다시 요청할 수 있어요.' };
  }
  if (order.simType !== 'ESIM' || order.issuedAt !== null) {
    return { allowed: false, reason: '한 번도 발급되지 않은 이심 주문만 다시 발급할 수 있어요.' };
  }
  return { allowed: true };
}

/** Operator-facing sentences for the action errors (backend `AdminActionExecutor`). */
const ACTION_ERRORS: Record<string, string> = {
  ADMIN_REASON_REQUIRED: '사유를 입력해 주세요.',
  ORDER_NOT_REFUNDABLE: '지금 상태에서는 환불할 수 없어요. 최신 상태를 확인해 주세요.',
  SIM_NOT_REFUNDABLE: '설치·개통된 SIM이라 환불할 수 없어요.',
  ORDER_NOT_REISSUABLE: '다시 발급할 수 없는 주문이에요. 최신 상태를 확인해 주세요.',
  ACTION_CONFLICT: '다른 조치나 시스템 처리가 먼저 반영됐어요. 최신 상태를 확인해 주세요.',
  ORDER_NOT_FOUND: '주문을 찾지 못했어요.',
};

export function formatActionError(code: string, fallback: (code: string) => string): string {
  return ACTION_ERRORS[code] ?? fallback(code);
}
