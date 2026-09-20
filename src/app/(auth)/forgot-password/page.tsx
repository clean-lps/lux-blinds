import Link from 'next/link';
import { AuthFrame, ForgotPasswordForm } from '@/components/auth/auth-forms';

export default function ForgotPasswordPage() {
  return (
    <AuthFrame
      title="Recover your password"
      description="Enter your account email and we will send the next steps."
      photo
      footer={<p>Remembered your password? <Link href="/login">Back to sign in</Link></p>}
    >
      <ForgotPasswordForm />
    </AuthFrame>
  );
}
