import { cn } from '@/lib/cn';

/**
 * Small "work in progress" indicator next to texts like "발급하고 있어요". Decorative: the text beside it
 * carries the meaning (and its role="status"), so the spinner is hidden from assistive technology.
 * Stops spinning for people who ask the system to reduce motion.
 */
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0 animate-spin rounded-full border-brand border-t-transparent motion-reduce:animate-none',
        size === 'sm' && 'size-3.5 border-2',
        size === 'md' && 'size-5 border-2',
        size === 'lg' && 'size-8 border-[3px]',
        className,
      )}
    />
  );
}
