import { describe, expect, it } from 'vitest';

import type { AdminOrderInfo, AdminProfileInfo } from '@/lib/api/types';

import { manualRefundAvailability, reissueAvailability } from './action-policy';

const order = (patch: Partial<AdminOrderInfo>): AdminOrderInfo => ({
  orderNo: 'R1',
  userId: 'user-1',
  planId: 1,
  simType: 'ESIM',
  amount: { amount: 9900, currency: 'KRW' },
  travelStartDate: '2026-11-01',
  status: 'NEEDS_ATTENTION',
  createdAt: '2026-10-21T00:00:00Z',
  expiresAt: '2026-10-21T00:10:00Z',
  issuedAt: null,
  ...patch,
});

const profile = (refundable: boolean) => ({ refundable }) as AdminProfileInfo;

describe('운영자 조치 가능 여부', () => {
  it('refund_follows_backend_status_set', () => {
    expect(manualRefundAvailability(order({ status: 'PAID' }), null).allowed).toBe(true);
    expect(manualRefundAvailability(order({ status: 'REFUNDING' }), null).allowed).toBe(false);
    expect(manualRefundAvailability(order({ status: 'ISSUE_REQUESTED' }), null).allowed).toBe(false);
  });

  it('issued_refund_needs_a_refundable_sim', () => {
    expect(manualRefundAvailability(order({ status: 'ISSUED' }), profile(true)).allowed).toBe(true);
    expect(manualRefundAvailability(order({ status: 'ISSUED' }), profile(false)).allowed).toBe(false);
  });

  it('reissue_only_for_never_issued_esim_needing_attention', () => {
    expect(reissueAvailability(order({})).allowed).toBe(true);
    expect(reissueAvailability(order({ simType: 'USIM' })).allowed).toBe(false);
    expect(reissueAvailability(order({ issuedAt: '2026-10-21T00:05:00Z' })).allowed).toBe(false);
    expect(reissueAvailability(order({ status: 'ISSUED' })).allowed).toBe(false);
  });
});
