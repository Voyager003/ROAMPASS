import { describe, expect, it } from 'vitest';

import { iccidError, normalizeIccid, passesLuhn } from './iccid';

// Appends the digit that makes the Luhn check pass (18-digit body → 19 digits, 19 → 20).
function withCheckDigit(body: string): string {
  for (let d = 0; d <= 9; d++) if (passesLuhn(body + d)) return body + d;
  throw new Error('unreachable');
}

describe('유심 ICCID 검증', () => {
  it('drops_spaces_and_hyphens', () => {
    expect(normalizeIccid('8982 0000-0000 0000 001')).toBe('8982000000000000001');
  });

  it('accepts_19_or_20_digits_with_valid_check_digit', () => {
    expect(iccidError(withCheckDigit('898200000000000001'))).toBeNull();
    expect(iccidError(withCheckDigit('8982000000000000012'))).toBeNull();
  });

  it('rejects_wrong_length_or_non_digits', () => {
    expect(iccidError('12345')).toContain('19~20자리');
    expect(iccidError('8982000000000000a01')).toContain('19~20자리');
  });

  it('rejects_bad_check_digit', () => {
    const valid = withCheckDigit('898200000000000001');
    const wrong = valid.slice(0, -1) + String((Number(valid.at(-1)) + 1) % 10);
    expect(iccidError(wrong)).toContain('맞지 않아요');
  });
});
