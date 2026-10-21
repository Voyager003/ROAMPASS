import { BadgeLabel, BadgeRoot } from '@seed-design/react';
import type { ReactNode } from 'react';

import type { Tone } from '@/lib/format/labels';

/**
 * Adapter from our status tones (lib/format/labels.ts) to SEED badge tones, so screens never
 * depend on SEED's vocabulary directly. Flat imports only: namespace imports (`Badge.Root`) break
 * the production build in Server Components (docs/decisions.md #20).
 */
const SEED_TONE = {
  neutral: 'neutral',
  progress: 'informative',
  success: 'positive',
  warning: 'warning',
  danger: 'critical',
} as const satisfies Record<Tone, string>;

/** Color is never the only signal: the text label always states the status. */
export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <BadgeRoot tone={SEED_TONE[tone]} variant="weak">
      <BadgeLabel>{children}</BadgeLabel>
    </BadgeRoot>
  );
}
