import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/server/auth/session';

export default async function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const headers = new Headers();
  for (const c of allCookies) {
    headers.set('cookie', `${c.name}=${c.value}`);
  }
  const session = await auth.api.getSession({ headers });

  if (!session) {
    redirect('/login');
  }

  if (session!.user.role === 'admin') {
    redirect('/admin-orders');
  }

  return children;
}
