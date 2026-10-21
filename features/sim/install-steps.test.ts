import { describe, expect, it } from 'vitest';

import { installSteps } from './install-steps';

describe('설치 상태 5단계', () => {
  it('marks_every_stage_up_to_the_current_one', () => {
    const steps = installSteps('INSTALLED');
    expect(steps.map((s) => s.status)).toEqual(['ISSUED', 'QR_VIEWED', 'INSTALLED', 'ACTIVE', 'EXPIRED']);
    expect(steps.filter((s) => s.reached).map((s) => s.status)).toEqual(['ISSUED', 'QR_VIEWED', 'INSTALLED']);
    expect(steps.find((s) => s.current)?.status).toBe('INSTALLED');
  });
});
