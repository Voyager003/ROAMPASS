import { describe, expect, it } from 'vitest';

import { isAdminId, isUserId, otherId, resolveAdminId, resolveUserId } from './identities';

describe('데모 신원', () => {
  it('accepts_only_listed_ids_per_role', () => {
    expect(isUserId('user-1')).toBe(true);
    expect(isUserId('admin-1')).toBe(false);
    expect(isAdminId('admin-2')).toBe(true);
    expect(isAdminId('user-2')).toBe(false);
    expect(isUserId('user-1; X-Admin-Id: admin-1')).toBe(false);
  });

  it('falls_back_to_default_when_cookie_missing_or_unknown', () => {
    expect(resolveUserId(undefined)).toBe('user-1');
    expect(resolveUserId('user-9')).toBe('user-1');
    expect(resolveUserId('user-2')).toBe('user-2');
    expect(resolveAdminId('')).toBe('admin-1');
    expect(resolveAdminId('admin-2')).toBe('admin-2');
  });

  it('toggles_to_the_other_id_of_the_same_role', () => {
    expect(otherId('user', 'user-1')).toBe('user-2');
    expect(otherId('user', 'user-2')).toBe('user-1');
    expect(otherId('admin', 'admin-1')).toBe('admin-2');
  });
});
