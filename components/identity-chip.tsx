import { switchIdentity } from '@/lib/auth/actions';
import { cn } from '@/lib/cn';
import { otherId, type Role } from '@/lib/auth/identities';
import { getAdminId, getUserId } from '@/lib/auth/session';

/**
 * Shows the current demo identity and switches to the other id of the role (docs/decisions.md #4).
 * A Server Component with a plain <form action>: no client state, the cookie is set on the server.
 * Reads a cookie, so callers wrap it in <Suspense>.
 */
export async function IdentityChip({ role, tone = 'light' }: { role: Role; tone?: 'light' | 'dark' }) {
  const current = role === 'user' ? await getUserId() : await getAdminId();
  const next = otherId(role, current);
  return (
    <form
      action={switchIdentity}
      className={cn('flex items-center gap-1.5 text-xs', tone === 'light' ? 'text-fg-muted' : 'text-fg-inverted/80')}
    >
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="id" value={next} />
      <span className="tabular-nums">{current}</span>
      <button
        type="submit"
        className={cn(
          'rounded-full border px-2 py-0.5',
          tone === 'light' ? 'border-line text-fg-muted hover:text-fg' : 'border-fg-inverted/40 hover:text-fg-inverted',
        )}
        aria-label={`${next}(으)로 신원 바꾸기`}
      >
        바꾸기
      </button>
    </form>
  );
}
