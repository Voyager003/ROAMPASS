import type { ReactNode } from 'react';

/**
 * Fixed bottom call-to-action area ("결제하러 가기"), as in the demo video (docs/decisions.md #32).
 * Renders a spacer of the same height so the last section is never hidden behind it.
 * The button itself is a SEED ActionButton passed as children (grey when disabled, brand when enabled).
 */
export function BottomCta({ children }: { children: ReactNode }) {
  return (
    <>
      <div aria-hidden className="h-24" />
      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-layer/95 backdrop-blur sm:border-x">
        <div className="mx-auto grid max-w-[480px] px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">{children}</div>
      </div>
    </>
  );
}
