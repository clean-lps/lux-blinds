import { afterEach, expect, it, vi } from 'vitest';
const send=vi.hoisted(()=>vi.fn());
vi.mock('resend',()=>({Resend:class {emails={send};}}));
afterEach(()=>{vi.unstubAllEnvs();vi.resetModules();send.mockReset();});
it('fails rather than silently mocking mail in production without credentials',async()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('RESEND_API_KEY','');
 const {sendVerificationEmail}=await import('@/server/email/service');
 await expect(sendVerificationEmail('test@example.test','123456','registration')).rejects.toThrow('not configured');
});
it('does not report success when Resend returns an error response',async()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('RESEND_API_KEY','re_test');send.mockResolvedValue({data:null,error:{message:'rejected'}});
 const {sendTransactionalEmail}=await import('@/server/email/service');
 await expect(sendTransactionalEmail('test@example.test','Test','Test')).rejects.toThrow('delivery failed');
});
