/**
 * Types mirroring the ROAMPASS backend contract (ROAMPASS_SERVER, phase P6).
 *
 * Every shape here was taken from the backend's response records and enums, not from the plan:
 * controllers under `roampass-api/src/main/java/com/roampass_server/{plan,order,payment,issuance,mysim,admin}/api`
 * and the application records they return. Field names are the Java record component names,
 * serialized as-is by Jackson. When the backend changes a field, change it here first and let the
 * compiler find the screens (CLAUDE.md §1 layer rules).
 *
 * Conventions:
 * - Instants are ISO-8601 strings in UTC as sent by the backend ("2026-05-01T15:20:00Z").
 *   They are converted to KST only when displayed (lib/format).
 * - Calendar dates without time (travel start date) are "YYYY-MM-DD" in KST.
 * - `expiresAtKst` is the one KST value the backend sends, as a LocalDateTime string without zone
 *   ("2026-05-09T00:20:00"); it is displayed as given.
 *
 * This file has no runtime dependencies and is NOT server-only: Client Components may
 * `import type` from it. Only lib/api/client.ts is server-only.
 */

// ---------------------------------------------------------------------------
// Shared values
// ---------------------------------------------------------------------------

export const SIM_TYPES = ['ESIM', 'USIM'] as const;
export type SimType = (typeof SIM_TYPES)[number];

export const CURRENCIES = ['KRW', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Backend `MoneyResponse`: amount in the currency's minor unit (KRW: won). Never negative. */
export type Money = {
  amount: number;
  currency: Currency;
};

/** ISO-8601 instant in UTC. */
export type Instant = string;

/** "YYYY-MM-DD", interpreted in KST. */
export type LocalDate = string;

/** ISO local date-time without zone, already in KST (backend `UsagePeriod.expiresAtKst`). */
export type KstDateTime = string;

/** e.g. "ORD-20261020-AB12CD34" (backend decisions #29). */
export type OrderNo = string;

/** RFC 9457 problem details + `code` (backend `GlobalExceptionHandler`). */
export type ProblemDetail = {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Machine-readable error code, e.g. "ORDER_NOT_FOUND", "PAYMENT_IN_PROGRESS", "SIM_NOT_REFUNDABLE". */
  code: string;
};

/** Backend `PageResult<T>`: page is 0-based. */
export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
};

// ---------------------------------------------------------------------------
// States (backend enums)
// ---------------------------------------------------------------------------

/** Backend `OrderStatus`: from payment up to handing out the SIM (or refunding). */
export const ORDER_STATUSES = [
  'PENDING', // created, waiting for payment until expiresAt
  'EXPIRED', // payment window passed without payment
  'PAID', // eSIM paid, waiting for the issuance scheduler
  'PICKUP_READY', // USIM paid, waiting for airport pickup and ICCID registration
  'ISSUE_REQUESTED', // eSIM: issuance requested to the supplier, waiting for its callback
  'ISSUED', // SIM handed out (eSIM profile received / USIM ICCID registered). USIM activation is on the profile
  'ISSUE_FAILED', // eSIM: supplier failed or callback timed out; automatic refund follows at once
  'REFUNDING', // refund opened, PG cancel scheduled (retries)
  'REFUNDED', // money returned, terminal
  'NEEDS_ATTENTION', // automatic recovery gave up; an operator must act
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Backend `PaymentStatus`: one payment attempt. */
export const PAYMENT_STATUSES = [
  'REQUESTED', // sent to the PG, result not yet known (reconciled by webhook or inquiry)
  'APPROVED',
  'FAILED',
  'PARTIALLY_CANCELLED',
  'CANCELLED',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Backend `InstallStatus`: what an issued SIM did on the user's device (§2.3-④). Never moves backwards. */
export const INSTALL_STATUSES = [
  'ISSUED', // QR / activation code can be shown
  'QR_VIEWED', // the only signal recorded by our own service
  'INSTALLED', // known only from the supplier's profile status
  'ACTIVE', // activated abroad; expiry counts from activatedAt
  'EXPIRED', // activatedAt + 24h × usage days passed (judged at read time)
] as const;
export type InstallStatus = (typeof INSTALL_STATUSES)[number];

/** Backend `RefundStatus`: one refund request. */
export const REFUND_STATUSES = [
  'PENDING', // waiting for the next PG cancel attempt (nextRetryAt)
  'SUCCEEDED',
  'GAVE_UP', // retries exhausted, operator needed (a manual refund opens a new request)
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

/** Backend `IssuanceStatus`: one issuance request to the supplier. */
export const ISSUANCE_STATUSES = ['PENDING', 'ACCEPTED', 'COMPLETED', 'FAILED'] as const;
export type IssuanceStatus = (typeof ISSUANCE_STATUSES)[number];

/** Backend `CallbackOutcome`: what happened to a received PG webhook / supplier callback. */
export const CALLBACK_OUTCOMES = [
  'RECEIVED',
  'PROCESSED',
  'ALREADY_APPLIED',
  'AMOUNT_MISMATCH',
  'TARGET_NOT_FOUND',
  'IGNORED',
  'SIGNATURE_INVALID',
] as const;
export type CallbackOutcome = (typeof CALLBACK_OUTCOMES)[number];

export type CallbackSource = 'PG' | 'SUPPLIER';

/** Backend `TargetType`: which aggregate a timeline entry belongs to. */
export type HistoryTargetType = 'ORDER' | 'PAYMENT' | 'REFUND' | 'SIM_PROFILE';

// ---------------------------------------------------------------------------
// Plans — GET /api/plans
// ---------------------------------------------------------------------------

/** Backend `PlanResponse`. There is no single-plan endpoint; screens pick from the (cached) list. */
export type Plan = {
  planId: number;
  /** ISO 3166-1 alpha-2, upper case (e.g. "JP"). */
  countryCode: string;
  days: number;
  dataMb: number;
  simType: SimType;
  price: Money;
};

/** Query parameters of GET /api/plans. All optional, exact match. */
export type PlanFilter = {
  country?: string;
  simType?: SimType;
  days?: number;
  dataMb?: number;
};

// ---------------------------------------------------------------------------
// Orders & payment — /api/orders
// ---------------------------------------------------------------------------

/** Body of POST /api/orders. The Idempotency-Key header is passed separately (lib/api/http-client.ts). */
export type CreateOrderRequest = {
  planId: number;
  travelStartDate: LocalDate;
};

/** Backend `OrderResponse`. `status` is the effective status at read time (PENDING past expiresAt reads EXPIRED). */
export type Order = {
  orderNo: OrderNo;
  planId: number;
  /** Copied at order time; later plan changes do not affect the order. */
  simType: SimType;
  amount: Money;
  travelStartDate: LocalDate;
  status: OrderStatus;
  createdAt: Instant;
  /** Payment deadline (created + 10 minutes). */
  expiresAt: Instant;
};

/**
 * Backend `PayResponse` for POST /api/orders/{orderNo}/pay (no body; the backend generates the
 * idempotency key). `paymentStatus` REQUESTED means the PG result is not known yet: the order
 * stays PENDING until the webhook or the reconciliation scheduler settles it.
 */
export type PayResult = {
  orderNo: OrderNo;
  idempotencyKey: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
};

/** Backend `MyRefundResult` for POST /api/orders/{orderNo}/refund (202). PG cancel runs later. */
export type RefundResult = {
  orderNo: OrderNo;
  orderStatus: OrderStatus;
};

// ---------------------------------------------------------------------------
// My SIMs — /api/sims
// ---------------------------------------------------------------------------

/** Backend `MySimSummary`: one row of GET /api/sims (paid orders only, newest first). */
export type MySimSummary = {
  orderNo: OrderNo;
  planId: number;
  simType: SimType;
  amount: Money;
  travelStartDate: LocalDate;
  orderStatus: OrderStatus;
  /** Null before the SIM is issued. */
  installStatus: InstallStatus | null;
  createdAt: Instant;
};

/** Backend `MySimDetail.SimInfo`: present once the SIM is issued. */
export type SimInfo = {
  iccid: string;
  /** eSIM only, e.g. "LPA:1$smdp.example$X1Y2". USIM: null. */
  activationCode: string | null;
  installStatus: InstallStatus;
  usageDays: number;
  activatedAt: Instant | null;
  /** End of the usage period, null before activation. */
  expiresAt: Instant | null;
  expiresAtKst: KstDateTime | null;
  /** Seconds left, null before activation, 0 after expiry. */
  remainingSeconds: number | null;
  /** Deleted from the device (status keeps the furthest stage reached). */
  deleted: boolean;
};

export type IssuanceWaitingStage = 'QUEUED' | 'REQUESTED';

export const ISSUANCE_WAITING_ACTIONS = ['WAIT', 'CHECK_LATER', 'REQUEST_REFUND'] as const;
export type IssuanceWaitingAction = (typeof ISSUANCE_WAITING_ACTIONS)[number];

/**
 * Backend `IssuanceWaiting`: present only for an eSIM order between payment and issuance.
 * The client re-reads the detail every `pollIntervalSeconds`.
 */
export type IssuanceWaiting = {
  /** QUEUED: not yet sent to the supplier (scheduler). REQUESTED: supplier is processing. */
  stage: IssuanceWaitingStage;
  requestedAt: Instant | null;
  /** If no result by then, the backend fails the issuance and refunds automatically. */
  resultDeadline: Instant | null;
  overdue: boolean;
  pollIntervalSeconds: number;
  actions: IssuanceWaitingAction[];
};

/**
 * Backend `MySimDetail` for GET /api/sims/{orderNo}. Also used as the order page payload:
 * it answers for any own order, including PENDING ones, and carries the refund verdict.
 */
export type MySimDetail = {
  orderNo: OrderNo;
  planId: number;
  simType: SimType;
  amount: Money;
  travelStartDate: LocalDate;
  /** Effective status at read time. */
  orderStatus: OrderStatus;
  createdAt: Instant;
  issuedAt: Instant | null;
  /** Whether a user refund request would be accepted right now (backend `UserRefundPolicy`). */
  refundable: boolean;
  /** Null before the SIM is issued. */
  sim: SimInfo | null;
  /** Null unless an eSIM order is between payment and issuance. */
  waiting: IssuanceWaiting | null;
};

/** Demo API result (POST /api/sims/{orderNo}/demo/install|activate): install status after the change. */
export type DemoSimState = { status: InstallStatus };

/** Demo API result (POST /api/orders/{orderNo}/demo/pickup-card): the card number the supplier hands out. */
export type PickupCard = { iccid: string };

/** Backend `UsimRegistrationResult`. installStatus ISSUED means activation is not confirmed yet (polling). */
export type UsimRegistrationResult = {
  orderNo: OrderNo;
  iccid: string;
  installStatus: InstallStatus;
};

// ---------------------------------------------------------------------------
// Admin — /admin/**
// ---------------------------------------------------------------------------

/** Backend `AdminResponse<T>`: asOf is when the backend read the data (UTC). */
export type WithAsOf<T> = {
  asOf: Instant;
  data: T;
};

/** Query parameters of GET /admin/orders (assignment §2.3-⑤: payment / issuance·install / SIM type / period). */
export type AdminOrderFilter = {
  /** Stored order status (covers the issuance steps ISSUE_REQUESTED / ISSUED / ISSUE_FAILED). */
  status?: OrderStatus;
  /** Status of the order's latest payment attempt. */
  paymentStatus?: PaymentStatus;
  /** Install status judged at read time (an ACTIVE SIM past its usage period is EXPIRED). */
  installStatus?: InstallStatus;
  simType?: SimType;
  /** Created-at range as UTC instants (ISO date-time). */
  from?: Instant;
  to?: Instant;
  /** 0-based. */
  page?: number;
  /** 1..50. */
  size?: number;
};

/** Backend `AdminOrderSummary`: list row, also used inside admin issues. */
export type AdminOrderSummary = {
  orderNo: OrderNo;
  userId: string;
  simType: SimType;
  amount: Money;
  orderStatus: OrderStatus;
  /** Latest payment attempt, null before payment. */
  paymentStatus: PaymentStatus | null;
  /** Null before the SIM is issued. Judged at read time (EXPIRED included). */
  installStatus: InstallStatus | null;
  createdAt: Instant;
};

export type AdminOrderInfo = {
  orderNo: OrderNo;
  userId: string;
  planId: number;
  simType: SimType;
  amount: Money;
  travelStartDate: LocalDate;
  /** Stored status as-is (no read-time judgement) so operators see what the system recorded. */
  status: OrderStatus;
  createdAt: Instant;
  expiresAt: Instant;
  issuedAt: Instant | null;
};

export type AdminPaymentInfo = {
  idempotencyKey: string;
  status: PaymentStatus;
  amount: Money;
  cancelledAmount: Money;
  pgTid: string | null;
  failureReason: string | null;
  requestedAt: Instant;
  approvedAt: Instant | null;
};

export type AdminIssuanceInfo = {
  attempt: number;
  status: IssuanceStatus;
  supplierOrderNo: string | null;
  failureReason: string | null;
  requestedAt: Instant;
  completedAt: Instant | null;
};

export type AdminProfileInfo = {
  simType: SimType;
  iccid: string;
  status: InstallStatus;
  usageDays: number;
  issuedAt: Instant;
  qrViewedAt: Instant | null;
  installedAt: Instant | null;
  activatedAt: Instant | null;
  deletedAt: Instant | null;
  expiresAt: Instant | null;
  expiresAtKst: KstDateTime | null;
  refundable: boolean;
};

export type AdminRefundInfo = {
  id: number;
  status: RefundStatus;
  amount: Money;
  attemptCount: number;
  nextRetryAt: Instant | null;
  lastError: string | null;
  createdAt: Instant;
  completedAt: Instant | null;
};

/**
 * Backend `TimelineEntry`: when, what (target + transition), who (actor), why (reason).
 * `actor` is the backend's string form: "USER:user-1", "ADMIN:admin-1", "SYSTEM", "PG", "SUPPLIER"
 * (parsed by lib/format `parseActor`).
 */
export type TimelineEntry = {
  occurredAt: Instant;
  targetType: HistoryTargetType;
  targetKey: string;
  fromStatus: string | null;
  toStatus: string;
  actor: string;
  reason: string;
};

/** Backend `CallbackInfo`. eventKey is null when the signature failed (body not trusted). */
export type CallbackInfo = {
  source: CallbackSource;
  eventKey: string | null;
  signatureOk: boolean;
  outcome: CallbackOutcome;
  note: string | null;
  receivedAt: Instant;
};

/** Backend `AdminOrderDetail` for GET /admin/orders/{orderNo}. */
export type AdminOrderDetail = {
  order: AdminOrderInfo;
  payments: AdminPaymentInfo[];
  issuanceRequests: AdminIssuanceInfo[];
  profile: AdminProfileInfo | null;
  refunds: AdminRefundInfo[];
  timeline: TimelineEntry[];
  callbacks: CallbackInfo[];
};

/** Backend `AdminIssues` for GET /admin/issues: four groups, each capped at `roampass.admin.issue-limit`. */
export type AdminIssues = {
  /** Paid (PAID / ISSUE_REQUESTED) but not issued after `stuckThresholdMinutes`. */
  stuckAfterPayment: AdminOrderSummary[];
  /** Automatic recovery gave up. */
  needsAttention: AdminOrderSummary[];
  /** Recent PG notifications whose amount differs from the order. */
  amountMismatches: CallbackInfo[];
  /** Recent notifications rejected for a bad signature. */
  signatureFailures: CallbackInfo[];
  stuckThresholdMinutes: number;
};

/** Frontend-side keys for the four groups of `AdminIssues` (labels in lib/format). */
export const ISSUE_TYPES = ['PAID_NOT_ISSUED', 'NEEDS_ATTENTION', 'AMOUNT_MISMATCH', 'SIGNATURE_INVALID'] as const;
export type IssueType = (typeof ISSUE_TYPES)[number];

/** Operator action body. The reason is required (400 ADMIN_REASON_REQUIRED when blank). */
export type OperatorActionRequest = {
  reason: string;
};

/**
 * Backend `AdminActionResult`: manual refund → REFUNDING (PG cancel by the scheduler), reissue → ISSUE_REQUESTED.
 * Once-only execution is the backend's: a second operator gets 409 (ACTION_CONFLICT or ORDER_NOT_REFUNDABLE /
 * ORDER_NOT_REISSUABLE), which the screen shows as "already processed".
 */
export type OperatorActionResult = {
  orderNo: OrderNo;
  orderStatus: OrderStatus;
};
