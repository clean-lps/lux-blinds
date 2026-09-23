import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('Neon object storage configuration', () => {
  it('accepts the S3-compatible credentials injected by Neon', async () => {
    vi.stubEnv('STORAGE_PROVIDER', 'neon');
    vi.stubEnv('STORAGE_BUCKET', 'lux-uploads');
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'nak_live_test');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test-secret');
    vi.stubEnv('AWS_ENDPOINT_URL_S3', 'https://storage.example.test');

    const { isS3Configured } = await import('@/server/storage/s3');

    expect(isS3Configured()).toBe(true);
  });
});
