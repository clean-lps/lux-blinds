import { describe, expect, it } from 'vitest';
import { postVerificationPath } from '@/components/auth/redirects';

describe('postVerificationPath', () => {
  it('sends verified accounts to sign-in because verification has not established a browser session', () => {
    expect(postVerificationPath()).toBe('/login');
  });
});
