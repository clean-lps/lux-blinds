import Link from 'next/link';
import { AuthFrame, ResetPasswordForm } from '@/components/auth/auth-forms';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return (
    <AuthFrame
      title="Set a new password"
      description="Choose a new password for your LUX Blinds account."
      footer={<p>Need another recovery email? <Link href="/forgot-password">Start again</Link></p>}
    >
      <ResetPasswordForm token={params.token} />
    </AuthFrame>
  );
}
