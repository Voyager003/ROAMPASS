import type {
  CallbackOutcome,
  HistoryTargetType,
  InstallStatus,
  IssuanceStatus,
  IssuanceWaitingAction,
  IssuanceWaitingStage,
  IssueType,
  MySimDetail,
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  SimType,
} from '@/lib/api/types';

/**
 * Korean labels and visual tones for every state, shared by user and admin screens.
 * `Record<Status, …>` makes a missing state a compile error, so adding a state on the backend
 * (lib/api/types.ts) forces a label here. Components never map statuses inline (CLAUDE.md §1).
 */
export type Tone = 'neutral' | 'progress' | 'success' | 'warning' | 'danger';
export type StatusLabel = { label: string; tone: Tone };

export const ORDER_STATUS_LABELS: Record<OrderStatus, StatusLabel> = {
  PENDING: { label: '결제 대기', tone: 'neutral' },
  EXPIRED: { label: '결제 기한 만료', tone: 'neutral' },
  PAID: { label: '결제 완료', tone: 'progress' },
  ISSUE_REQUESTED: { label: '발급 중', tone: 'progress' },
  ISSUED: { label: '발급 완료', tone: 'success' },
  ISSUE_FAILED: { label: '발급 실패', tone: 'warning' },
  REFUNDING: { label: '환불 진행 중', tone: 'warning' },
  REFUNDED: { label: '환불 완료', tone: 'neutral' },
  NEEDS_ATTENTION: { label: '운영자 확인 필요', tone: 'danger' },
  PICKUP_READY: { label: '공항 수령 대기', tone: 'progress' },
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, StatusLabel> = {
  REQUESTED: { label: '승인 대기', tone: 'progress' },
  APPROVED: { label: '승인', tone: 'success' },
  FAILED: { label: '승인 실패', tone: 'danger' },
  CANCELLED: { label: '전액 취소', tone: 'neutral' },
  PARTIALLY_CANCELLED: { label: '부분 취소', tone: 'neutral' },
};

export const INSTALL_STATUS_LABELS: Record<InstallStatus, StatusLabel> = {
  ISSUED: { label: '설치 전', tone: 'neutral' },
  QR_VIEWED: { label: 'QR 확인함', tone: 'progress' },
  INSTALLED: { label: '설치됨', tone: 'progress' },
  ACTIVE: { label: '사용 중', tone: 'success' },
  EXPIRED: { label: '사용 기간 종료', tone: 'neutral' },
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, StatusLabel> = {
  PENDING: { label: 'PG 취소 대기', tone: 'progress' },
  SUCCEEDED: { label: '환불 성공', tone: 'success' },
  GAVE_UP: { label: '재시도 소진', tone: 'danger' },
};

export const ISSUANCE_STATUS_LABELS: Record<IssuanceStatus, StatusLabel> = {
  PENDING: { label: '요청 중', tone: 'progress' },
  ACCEPTED: { label: '공급사 접수', tone: 'progress' },
  COMPLETED: { label: '발급 완료', tone: 'success' },
  FAILED: { label: '실패', tone: 'danger' },
};

export const CALLBACK_OUTCOME_LABELS: Record<CallbackOutcome, StatusLabel> = {
  RECEIVED: { label: '수신', tone: 'neutral' },
  PROCESSED: { label: '반영', tone: 'success' },
  ALREADY_APPLIED: { label: '이미 반영됨', tone: 'neutral' },
  AMOUNT_MISMATCH: { label: '금액 불일치', tone: 'warning' },
  TARGET_NOT_FOUND: { label: '대상 없음', tone: 'warning' },
  IGNORED: { label: '무시', tone: 'neutral' },
  SIGNATURE_INVALID: { label: '서명 불일치', tone: 'danger' },
};

export const HISTORY_TARGET_LABELS: Record<HistoryTargetType, string> = {
  ORDER: '주문',
  PAYMENT: '결제',
  REFUND: '환불',
  SIM_PROFILE: 'SIM',
};

/**
 * Timeline statuses arrive as strings whose meaning depends on the target (an order's PENDING is not a
 * refund's PENDING). Unknown values are shown as given, so a new backend status is visible, not hidden.
 */
export function formatHistoryStatus(targetType: HistoryTargetType, status: string): string {
  const table: Record<string, StatusLabel> =
    targetType === 'ORDER'
      ? ORDER_STATUS_LABELS
      : targetType === 'PAYMENT'
        ? PAYMENT_STATUS_LABELS
        : targetType === 'REFUND'
          ? REFUND_STATUS_LABELS
          : INSTALL_STATUS_LABELS;
  return table[status]?.label ?? status;
}

export const ISSUE_TYPE_LABELS: Record<IssueType, StatusLabel> = {
  PAID_NOT_ISSUED: { label: '결제 후 미발급', tone: 'danger' },
  // NEEDS_ATTENTION is reached only when PG cancellation failed 3 times (backend README 2.2).
  NEEDS_ATTENTION: { label: '환불 실패', tone: 'danger' },
  AMOUNT_MISMATCH: { label: '결제 금액 불일치', tone: 'warning' },
  SIGNATURE_INVALID: { label: '서명 불일치', tone: 'warning' },
};

export const SIM_TYPE_LABELS: Record<SimType, string> = {
  ESIM: '이심(eSIM)',
  USIM: '유심(USIM)',
};

/**
 * "누가 / 어떤 신호로" for the admin timeline (assignment §2.3-⑤).
 * The backend sends the actor as a string: "USER:user-1", "ADMIN:admin-1", "SYSTEM", "PG", "SUPPLIER".
 */
export function formatActor(actor: string): string {
  const [type, id] = actor.split(':', 2);
  switch (type) {
    case 'USER':
      return `사용자 ${id ?? ''}`.trim();
    case 'ADMIN':
      return `운영자 ${id ?? ''}`.trim();
    case 'SYSTEM':
      return '시스템(스케줄러)';
    case 'PG':
      return 'PG 통지';
    case 'SUPPLIER':
      return '공급사 신호';
    default:
      return actor;
  }
}

/**
 * Why a user refund is not possible right now. The backend only sends `refundable: boolean`
 * (backend `UserRefundPolicy`: before issuance, or issued but never installed/activated); the
 * sentence is derived here from the same states the backend judged.
 */
export function formatRefundBlockReason(detail: Pick<MySimDetail, 'orderStatus' | 'sim'>): string {
  switch (detail.orderStatus) {
    case 'PENDING':
    case 'EXPIRED':
      return '결제가 완료되지 않은 주문이에요.';
    case 'ISSUE_REQUESTED':
      return '공급사에서 발급을 진행 중이라 지금은 환불할 수 없어요. 발급이 늦어지면 자동으로 환불돼요.';
    case 'ISSUE_FAILED':
    case 'REFUNDING':
      return '환불이 진행 중이에요.';
    case 'REFUNDED':
      return '이미 환불된 주문이에요.';
    case 'NEEDS_ATTENTION':
      return '운영자가 확인 중인 주문이에요.';
    case 'ISSUED':
      switch (detail.sim?.installStatus) {
        case 'INSTALLED':
          return '기기에 설치된 SIM은 환불할 수 없어요.';
        case 'ACTIVE':
          return '개통된 SIM은 환불할 수 없어요.';
        case 'EXPIRED':
          return '사용 기간이 끝난 SIM이에요.';
        default:
          return '현재 환불할 수 없는 상태예요.';
      }
    default:
      return '현재 환불할 수 없는 상태예요.';
  }
}

/**
 * Usage period of a plan. Expiry counts from activation, not from the travel start date
 * (24 hours × days, assignment appendix A), so the copy says so instead of implying a calendar range.
 */
export function formatUsageDays(days: number): string {
  return `개통 시점부터 ${days}일 (24시간 × ${days})`;
}

/** Issuance waiting stage (backend `IssuanceWaiting.stage`). */
export const WAITING_STAGE_LABELS: Record<IssuanceWaitingStage, { title: string; description: string }> = {
  QUEUED: { title: '발급을 준비하고 있어요', description: '결제가 확인됐어요. 곧 공급사에 발급을 요청해요.' },
  REQUESTED: { title: '공급사에서 발급하고 있어요', description: '결과가 나오면 이 화면에 바로 보여 드려요.' },
};

/** What the user can do while issuance is late (backend `IssuanceWaiting.actions`). */
export const WAITING_ACTION_LABELS: Record<IssuanceWaitingAction, string> = {
  WAIT: '이 화면에서 기다리기',
  CHECK_LATER: '창을 닫아도 발급은 계속돼요. 나중에 내 SIM에서 확인하세요.',
  REQUEST_REFUND: '지금 환불 요청하기',
};

const regionNames = new Intl.DisplayNames(['ko'], { type: 'region', fallback: 'code' });

/** "JP" → "일본". Codes without a Korean name, or malformed codes, are shown as given. */
export function formatCountry(countryCode: string): string {
  try {
    return regionNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}
