// SEED's stylesheet first, then ours (brand override and Tailwind mappings must come after it).
import '@seed-design/css/all.css';
import './globals.css';

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: { default: 'ROAMPASS', template: '%s | ROAMPASS' },
  description: '여행용 이심·유심 데이터 요금제',
};

export const viewport: Viewport = { colorScheme: 'light' };

/**
 * SEED reads its theme from attributes on <html> (manual installation guide). The app is light-only,
 * so the attributes are static and no color-scheme detection script is needed.
 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" data-seed="" data-seed-color-mode="light-only" data-seed-user-color-scheme="light">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
