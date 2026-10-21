/**
 * USIM ICCID check before sending, mirroring the backend `Iccid` rule (19–20 digits + Luhn check
 * digit) so a typo is caught at once. The backend checks again and stays the authority.
 */
const DIGITS = /^\d{19,20}$/;

/** What people type off the card: spaces and hyphens are dropped. */
export function normalizeIccid(input: string): string {
  return input.replace(/[\s-]/g, '');
}

/** Luhn: from the right, double every second digit (minus 9 if above 9); valid when the sum ends in 0. */
export function passesLuhn(digits: string): boolean {
  let sum = 0;
  let doubleIt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (doubleIt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    doubleIt = !doubleIt;
  }
  return sum % 10 === 0;
}

/** null when valid, otherwise the sentence to show. */
export function iccidError(iccid: string): string | null {
  if (!DIGITS.test(iccid)) return 'ICCID는 숫자 19~20자리예요. 유심 카드 뒷면의 번호를 확인해 주세요.';
  if (!passesLuhn(iccid)) return 'ICCID 번호가 맞지 않아요. 한 자리씩 다시 확인해 주세요.';
  return null;
}
