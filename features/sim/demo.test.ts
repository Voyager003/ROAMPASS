import { describe, expect, it } from 'vitest';

import { demoSimButtons } from './demo';

const esim = { simType: 'ESIM', orderStatus: 'ISSUED', deleted: false } as const;

describe('시연 버튼 표시 조건', () => {
  it('shows_install_and_activate_before_install', () => {
    expect(demoSimButtons({ ...esim, installStatus: 'ISSUED' })).toEqual({ install: true, activate: true });
    expect(demoSimButtons({ ...esim, installStatus: 'QR_VIEWED' })).toEqual({ install: true, activate: true });
  });

  it('shows_only_activate_after_install', () => {
    expect(demoSimButtons({ ...esim, installStatus: 'INSTALLED' })).toEqual({ install: false, activate: true });
  });

  it('hides_both_once_active_or_expired', () => {
    expect(demoSimButtons({ ...esim, installStatus: 'ACTIVE' })).toEqual({ install: false, activate: false });
    expect(demoSimButtons({ ...esim, installStatus: 'EXPIRED' })).toEqual({ install: false, activate: false });
  });

  it('hides_both_for_usim_refunded_or_deleted', () => {
    expect(demoSimButtons({ ...esim, simType: 'USIM', installStatus: 'ISSUED' })).toEqual({ install: false, activate: false });
    expect(demoSimButtons({ ...esim, orderStatus: 'REFUNDED', installStatus: 'ISSUED' })).toEqual({
      install: false,
      activate: false,
    });
    expect(demoSimButtons({ ...esim, deleted: true, installStatus: 'ISSUED' })).toEqual({ install: false, activate: false });
  });
});
