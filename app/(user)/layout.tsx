/**
 * Traveler screens: one phone-width column on the grey basement (docs/decisions.md #32, #36).
 * Tab screens add the top bar and bottom tab bar in (tabs)/layout.tsx; flow screens (configure,
 * order) render their own ScreenHeader and BottomCta instead.
 */
export default function UserLayout({ children }: LayoutProps<'/'>) {
  return <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-basement">{children}</div>;
}
