import { ISSUE_TYPES, type IssueType } from '@/lib/api/types';

/**
 * The pending-work screen (/admin/issues, backend `GET /admin/issues`) shows one group at a time,
 * chosen in the URL (`?type=`) like the order list's filters. `ALL` shows every group.
 */
export type PendingFilter = IssueType | 'ALL';

export function parsePendingFilter(raw: string | string[] | undefined): PendingFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (ISSUE_TYPES as readonly string[]).includes(value ?? '') ? (value as IssueType) : 'ALL';
}

export function pendingHref(filter: PendingFilter): string {
  return filter === 'ALL' ? '/admin/issues' : `/admin/issues?type=${filter}`;
}

/** Order groups hold orders; the other two hold received notifications (no order number in the response). */
export const ORDER_GROUPS = ['PAID_NOT_ISSUED', 'NEEDS_ATTENTION'] as const satisfies readonly IssueType[];
export const CALLBACK_GROUPS = ['AMOUNT_MISMATCH', 'SIGNATURE_INVALID'] as const satisfies readonly IssueType[];

/** What each group means, with the backend's rule (shown under the filter). */
export function pendingDescription(type: IssueType, stuckThresholdMinutes: number): string {
  switch (type) {
    case 'PAID_NOT_ISSUED':
      return `결제 승인 후 ${stuckThresholdMinutes}분이 지나도록 발급되지 않은 주문(결제 완료·발급 중)이에요. 정상이면 3분 안에 발급되거나 자동 환불로 넘어가요.`;
    case 'NEEDS_ATTENTION':
      return 'PG 취소를 3번 시도해도 실패해 자동 처리를 멈춘 주문이에요. 상세에서 수동 환불이나 발급 재시도를 해 주세요.';
    case 'AMOUNT_MISMATCH':
      return '결제 금액이 주문과 다른 PG 통지예요(최근). 결제를 확정하지 않고 승인 대기로 남겨 두었어요.';
    case 'SIGNATURE_INVALID':
      return '서명이 맞지 않아 거부한 통지예요(최근). 위조되었거나 비밀키가 어긋났을 수 있어요.';
  }
}
