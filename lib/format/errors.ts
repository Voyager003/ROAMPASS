/**
 * User-facing sentences for backend error codes (ProblemDetail `code`). Screens never show raw codes
 * as the main message; unknown codes get a generic sentence and the code in parentheses.
 */
const MESSAGES: Record<string, string> = {
  // Connectivity (lib/api/http-client.ts)
  BACKEND_UNREACHABLE: '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',
  BACKEND_TIMEOUT: '서버 응답이 늦어요. 잠시 후 다시 시도해 주세요.',
  // Order creation
  INVALID_TRAVEL_START_DATE: '여행 시작일은 오늘부터 1년 안으로 골라 주세요.',
  PLAN_NOT_FOUND: '요금제를 찾지 못했어요. 다시 골라 주세요.',
  IDEMPOTENCY_KEY_REUSED: '이 화면에서 이미 다른 내용으로 주문했어요. 새로고침한 뒤 다시 골라 주세요.',
  INVALID_REQUEST: '입력값을 다시 확인해 주세요.',
  // Payment
  ORDER_NOT_FOUND: '주문을 찾지 못했어요.',
  ORDER_NOT_PAYABLE: '결제 기한이 지났거나 이미 결제된 주문이에요.',
  // User refund
  ORDER_NOT_REFUNDABLE: '지금은 환불을 요청할 수 없는 상태예요. 발급이 이미 시작됐을 수 있어요.',
  SIM_NOT_REFUNDABLE: '설치하거나 개통한 SIM은 환불할 수 없어요.',
  REFUND_CONFLICT: '다른 요청이 먼저 처리됐어요. 화면의 최신 상태를 확인해 주세요.',
  // eSIM activation code / USIM registration
  SIM_NOT_FOUND: '아직 발급되지 않은 SIM이에요.',
  INVALID_ICCID: 'ICCID 번호가 맞지 않아요. 유심 카드 뒷면의 번호를 다시 확인해 주세요.',
  ORDER_NOT_REGISTRABLE: '등록할 수 없는 주문이에요. 이미 등록됐는지 화면을 확인해 주세요.',
  ICCID_ALREADY_REGISTERED: '이미 다른 주문에 등록된 ICCID예요. 받은 유심의 번호인지 확인해 주세요.',
  CONFLICT: '이미 등록된 정보와 겹쳐요. 번호를 다시 확인해 주세요.',
  // Demo (install / activate / airport pickup)
  DEMO_NOT_APPLICABLE: '지금 상태에서는 할 수 없어요. 화면의 최신 상태를 확인해 주세요.',
  SUPPLIER_UNAVAILABLE: 'SIM 공급사가 응답하지 않아요. 잠시 후 다시 시도해 주세요.',
};

export function formatApiError(code: string): string {
  return MESSAGES[code] ?? `요청을 처리하지 못했어요. (${code})`;
}
