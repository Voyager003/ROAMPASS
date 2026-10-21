import type { OrderStatus } from '@/lib/api/types';

/**
 * Order statuses after payment that are still moving on the server without the user: the page keeps
 * re-reading while the order is in one of them (backend README §2.6 "사용자 쪽").
 * ISSUE_FAILED is included because the automatic refund starts right after it.
 * PICKUP_READY is not: it waits for the user (airport pickup, then ICCID registration).
 */
const MOVING_STATUSES: ReadonlySet<OrderStatus> = new Set(['PAID', 'ISSUE_REQUESTED', 'ISSUE_FAILED']);

export function isMoving(status: OrderStatus): boolean {
  return MOVING_STATUSES.has(status);
}

/** Poll interval when the backend gives none (ISSUE_FAILED has no `waiting`); same as the backend's. */
export const DEFAULT_POLL_INTERVAL_SECONDS = 3;

/**
 * Stop polling after this long and offer a manual refresh. A normal issuance ends within about
 * 2.5 minutes (2-minute callback limit + 30-second timeout check), so this only trips when the
 * server's schedulers are not running (docs/decisions.md #42).
 */
export const POLL_MAX_DURATION_MS = 5 * 60_000;

/**
 * Result screens where the server is still working (automatic refund after a failed issuance, PG
 * cancellation in progress): shown with a spinner, though the page stops polling at REFUNDING.
 */
const STILL_WORKING: ReadonlySet<OrderStatus> = new Set(['ISSUE_FAILED', 'REFUNDING']);

export function isStillWorking(status: OrderStatus): boolean {
  return STILL_WORKING.has(status);
}

export type ResultCopy = { title: string; description: string };

/** Headline of an order that left the waiting stage (or never had one). */
export function resultCopyOf(status: OrderStatus): ResultCopy | null {
  switch (status) {
    case 'ISSUED':
      return { title: 'SIM이 발급됐어요', description: '내 SIM에서 설치 방법과 사용 기간을 확인하세요.' };
    case 'ISSUE_FAILED':
      return { title: '발급에 실패했어요', description: '결제 금액을 자동으로 환불하고 있어요.' };
    case 'REFUNDING':
      return { title: '환불을 진행하고 있어요', description: '결제 수단으로 환불돼요. 완료되면 내 SIM에서 확인할 수 있어요.' };
    case 'REFUNDED':
      return { title: '환불이 완료됐어요', description: '결제 수단으로 환불됐어요.' };
    case 'NEEDS_ATTENTION':
      return {
        title: '운영자가 확인하고 있어요',
        description: '자동 처리가 끝나지 않아 운영자에게 넘어갔어요. 확인 후 처리해 드릴게요.',
      };
    case 'PICKUP_READY':
      return {
        title: '공항에서 유심을 받아 주세요',
        description: '받은 뒤 내 SIM에서 유심 뒷면의 ICCID를 등록하면 발급이 끝나요.',
      };
    default:
      // PENDING / EXPIRED / PAID / ISSUE_REQUESTED have their own screens.
      return null;
  }
}
