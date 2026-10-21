/**
 * Traveler screens: one phone-width column on the grey basement (docs/decisions.md #32, #36).
 * Tab screens add the top bar and bottom tab bar in (tabs)/layout.tsx; flow screens (configure,
 * order) render their own ScreenHeader and BottomCta instead.
 * On screens wider than a phone the column gets side borders and a shadow, so it reads as one
 * device-width screen instead of blending into the page background.
 */
export default function UserLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-basement sm:border-x sm:border-line sm:shadow-[0_0_24px_rgba(0,0,0,0.06)]">
      {children}
    </div>
  );
}
