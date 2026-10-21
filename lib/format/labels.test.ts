import { describe, expect, it } from 'vitest';

import { INSTALL_STATUSES, ISSUE_TYPES, ORDER_STATUSES, PAYMENT_STATUSES, REFUND_STATUSES } from '@/lib/api/types';

import {
  formatActor,
  formatCountry,
  formatRefundBlockReason,
  formatUsageDays,
  INSTALL_STATUS_LABELS,
  ISSUE_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  REFUND_STATUS_LABELS,
  type StatusLabel,
} from './labels';

// Completeness is enforced by the Record types at compile time. These tests check what the
// compiler cannot: every label is non-empty and no two states in a group look the same
// (two identical labels would make the admin filter ambiguous).
const groups: Array<[string, readonly string[], Record<string, StatusLabel>]> = [
  ['주문', ORDER_STATUSES, ORDER_STATUS_LABELS],
  ['결제', PAYMENT_STATUSES, PAYMENT_STATUS_LABELS],
  ['설치', INSTALL_STATUSES, INSTALL_STATUS_LABELS],
  ['환불 요청', REFUND_STATUSES, REFUND_STATUS_LABELS],
  ['이상 건', ISSUE_TYPES, ISSUE_TYPE_LABELS],
];

describe.each(groups)('%s 상태 라벨', (_name, statuses, labels) => {
  it('has_non_empty_label_for_every_status', () => {
    for (const status of statuses) {
      expect(labels[status]?.label.trim()).toBeTruthy();
    }
  });

  it('has_unique_labels_within_group', () => {
    const texts = statuses.map((s) => labels[s].label);
    expect(new Set(texts).size).toBe(texts.length);
  });
});

describe('신호·사유·국가 표시', () => {
  it('formats_each_backend_actor_string', () => {
    expect(formatActor('USER:user-1')).toBe('사용자 user-1');
    expect(formatActor('ADMIN:admin-1')).toBe('운영자 admin-1');
    expect(formatActor('SYSTEM')).toBe('시스템(스케줄러)');
    expect(formatActor('SUPPLIER')).toBe('공급사 신호');
    expect(formatActor('SOMETHING_NEW')).toBe('SOMETHING_NEW');
  });

  it('explains_refund_block_from_order_and_install_state', () => {
    expect(formatRefundBlockReason({ orderStatus: 'ISSUED', sim: null })).toBe('현재 환불할 수 없는 상태예요.');
    expect(formatRefundBlockReason({ orderStatus: 'ISSUED', sim: { installStatus: 'INSTALLED' } as never })).toContain('설치');
    expect(formatRefundBlockReason({ orderStatus: 'ISSUE_REQUESTED', sim: null })).toContain('자동으로 환불');
    expect(formatRefundBlockReason({ orderStatus: 'REFUNDED', sim: null })).toContain('이미 환불');
  });

  it('describes_usage_period_from_activation', () => {
    expect(formatUsageDays(5)).toBe('개통 시점부터 5일 (24시간 × 5)');
  });

  it('formats_country_in_korean_and_falls_back_to_code', () => {
    expect(formatCountry('JP')).toBe('일본');
    // AA is a user-assigned code with no name; J1 is not a valid region code at all.
    expect(formatCountry('AA')).toBe('AA');
    expect(formatCountry('J1')).toBe('J1');
  });
});
