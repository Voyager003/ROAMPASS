import { describe, expect, it } from 'vitest';

import { ORDER_STATUSES } from '@/lib/api/types';

import { isMoving, resultCopyOf } from './progress';

describe('결제 후 진행 상태', () => {
  it('polls_only_while_server_moves_the_order', () => {
    const moving = ORDER_STATUSES.filter(isMoving);
    expect(moving).toEqual(['PAID', 'ISSUE_REQUESTED', 'ISSUE_FAILED']);
  });

  it('does_not_poll_for_usim_pickup_because_it_waits_for_the_user', () => {
    expect(isMoving('PICKUP_READY')).toBe(false);
  });

  it('has_a_result_copy_for_every_status_without_its_own_screen', () => {
    const ownScreen = new Set(['PENDING', 'EXPIRED', 'PAID', 'ISSUE_REQUESTED']);
    for (const status of ORDER_STATUSES) {
      expect(resultCopyOf(status) === null).toBe(ownScreen.has(status));
    }
  });
});
