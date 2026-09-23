import { describe, expect, it } from 'vitest';
import { getInitialAdminConfig } from '@/server/bootstrap/initial-admin';

describe('getInitialAdminConfig', () => {
  it('requires both credentials when bootstrapping the first administrator', () => {
    expect(() => getInitialAdminConfig({ INITIAL_ADMIN_EMAIL: 'admin@example.test' })).toThrow('INITIAL_ADMIN_PASSWORD');
  });

  it('normalizes a valid administrator email without altering its password', () => {
    expect(getInitialAdminConfig({
      INITIAL_ADMIN_EMAIL: ' Admin@Example.Test ',
      INITIAL_ADMIN_PASSWORD: 'a-production-password',
      INITIAL_ADMIN_NAME: 'Operations',
    })).toEqual({
      email: 'admin@example.test',
      password: 'a-production-password',
      name: 'Operations',
    });
  });
});
