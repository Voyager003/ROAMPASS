import { describe, expect, it } from 'vitest';

import { CONFIRMING_MESSAGE, paymentErrorStateOf, paymentStateOf } from './payment';

describe('결제 결과 안내', () => {
  it('approved_shows_nothing_because_page_moves_on', () => {
    expect(paymentStateOf({ paymentStatus: 'APPROVED' })).toBeNull();
  });

  it('requested_means_result_unknown_and_tells_not_to_pay_again', () => {
    expect(paymentStateOf({ paymentStatus: 'REQUESTED' })).toEqual({ kind: 'confirming', message: CONFIRMING_MESSAGE });
  });

  it('failed_allows_retry', () => {
    expect(paymentStateOf({ paymentStatus: 'FAILED' })?.kind).toBe('error');
  });

  it('payment_in_progress_conflict_is_the_same_confirming_notice', () => {
    expect(paymentErrorStateOf('PAYMENT_IN_PROGRESS')).toEqual({ kind: 'confirming', message: CONFIRMING_MESSAGE });
  });

  it('other_codes_use_error_sentences', () => {
    expect(paymentErrorStateOf('ORDER_NOT_PAYABLE')).toEqual({
      kind: 'error',
      message: '결제 기한이 지났거나 이미 결제된 주문이에요.',
    });
  });
});
