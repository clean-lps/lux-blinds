import Link from 'next/link';
import { AuthFrame, LoginForm } from '@/components/auth/auth-forms';

export default function LoginPage() {
  return (
    <AuthFrame
      title="LUX Blinds Portal"
      description="Manage your custom blinds and curtain orders."
      photo
      align="end"
      footer={<p className="auth-footer-note">Your session is secured end-to-end.</p>}
    >
      <LoginForm />
    </AuthFrame>
  );
}
