import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/server/auth/session';

export default async function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'admin' || session.user.role === 'operator') {
    redirect('/admin-orders');
  }

  return children;
}
