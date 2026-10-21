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
};

export function formatApiError(code: string): string {
  return MESSAGES[code] ?? `요청을 처리하지 못했어요. (${code})`;
}
