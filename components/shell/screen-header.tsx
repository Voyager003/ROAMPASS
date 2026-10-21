import Link from 'next/link';

import { ArrowLeftIcon, HomeIcon } from './icons';

/**
 * Header of a flow screen (configure, order): back · title · home, as in the demo video
 * (docs/decisions.md #36). Back is a plain link to the parent screen, so no Client Component is needed.
 */
export function ScreenHeader({ title, backHref }: { title: string; backHref: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-layer">
      <div className="flex h-14 items-center gap-3 px-4">
        <Link href={backHref} aria-label="뒤로" className="-ml-1 p-1 text-fg">
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-[17px] font-bold text-fg">{title}</h1>
        <Link href="/" aria-label="홈" className="ml-auto p-1 text-fg">
          <HomeIcon />
        </Link>
      </div>
    </header>
  );
}
