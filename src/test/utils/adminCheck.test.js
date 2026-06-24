import { describe, it, expect, beforeEach } from 'vitest';
import { isUserAdmin } from '../../utils/adminCheck';

describe('isUserAdmin', () => {
  beforeEach(() => {
    import.meta.env.VITE_ADMIN_EMAILS = '["admin@test.com","admin2@test.com"]';
  });

  it('returns false for null/undefined user', () => {
    expect(isUserAdmin(null)).toBe(false);
    expect(isUserAdmin(undefined)).toBe(false);
  });

  it('returns true for admin emails', () => {
    expect(isUserAdmin({ email: 'admin@test.com' })).toBe(true);
    expect(isUserAdmin({ email: 'admin2@test.com' })).toBe(true);
  });

  it('returns false for non-admin emails', () => {
    expect(isUserAdmin({ email: 'user@test.com' })).toBe(false);
  });

  it('returns false when env var is not set', () => {
    delete import.meta.env.VITE_ADMIN_EMAILS;
    expect(isUserAdmin({ email: 'admin@test.com' })).toBe(false);
  });
});
