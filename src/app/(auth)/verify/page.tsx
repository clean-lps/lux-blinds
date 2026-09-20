import Link from 'next/link';
import { AuthFrame, VerificationForm } from '@/components/auth/auth-forms';

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ challengeId?: string; destination?: string }> }) {
  const params = await searchParams;
  return (
    <AuthFrame
      title="Verify your account"
      description="Confirm your email or phone before signing in."
      photo
      footer={<p>Need to start over? <Link href="/register">Return to registration</Link></p>}
    >
      <VerificationForm challengeId={params.challengeId} maskedDestination={params.destination} />
    </AuthFrame>
  );
}
