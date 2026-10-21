import { describe, expect, it } from 'vitest';

import { formatApiError } from './errors';

describe('백엔드 오류 문구', () => {
  it('maps_known_codes_to_sentences', () => {
    expect(formatApiError('INVALID_TRAVEL_START_DATE')).toContain('1년');
    expect(formatApiError('BACKEND_UNREACHABLE')).toContain('연결');
  });

  it('keeps_unknown_code_visible_in_generic_sentence', () => {
    expect(formatApiError('SOMETHING_NEW')).toBe('요청을 처리하지 못했어요. (SOMETHING_NEW)');
  });
});
