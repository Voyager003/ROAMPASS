import { describe, expect, it } from 'vitest';

import { splitActivationCode } from './activation-code';

describe('eSIM 활성화 코드', () => {
  it('splits_lpa_code_into_address_and_matching_id', () => {
    expect(splitActivationCode('LPA:1$smdp.example$X1Y2')).toEqual({ smdpAddress: 'smdp.example', matchingId: 'X1Y2' });
  });

  it('returns_null_for_other_forms', () => {
    expect(splitActivationCode('X1Y2')).toBeNull();
    expect(splitActivationCode('LPA:1$smdp.example')).toBeNull();
  });
});
