import Link from 'next/link';
import { AuthFrame, RegisterForm } from '@/components/auth/auth-forms';

export default function RegisterPage() {
  return (
    <AuthFrame
      title="Create Account"
      description="Register your company to submit and track orders."
      wide
      photo
      footer={<p>Already have an account? <Link href="/login">Sign in</Link></p>}
    >
      <RegisterForm />
    </AuthFrame>
  );
}
