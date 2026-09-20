'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import type { OrderStatus } from '@/contracts';
import { authApi } from '@/components/auth/api';
import styles from './client-ui.module.css';

const navigation = [
  { href: '/my-panel', label: 'Dashboard', key: 'dashboard' },
  { href: '/new-order', label: 'New Order', key: 'new-order' },
  { href: '/order-history', label: 'Order History', key: 'history' },
  { href: '/profile', label: 'My Profile', key: 'profile' },
] as const;

export type ClientNavKey = (typeof navigation)[number]['key'];

export type ClientDataMode = 'loading' | 'live' | 'preview';

export function ClientShell({ title, description, active, children, actions, dataMode = 'preview' }: { title: string; description: string; active: ClientNavKey; children: ReactNode; actions?: ReactNode; dataMode?: ClientDataMode }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Proceed to login even if logout call fails (session may already be expired)
    }
    router.push('/login');
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>LUX Blinds Portal</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{description}</p>
          </div>
          <nav className={styles.nav} aria-label="Client navigation">
            {navigation.map((item) => (
              <Link key={item.key} href={item.href} className={`${styles.navLink} ${active === item.key ? styles.navLinkActive : ''}`} aria-current={active === item.key ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
            {actions}
            <button className={styles.signOutButton} type="button" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </nav>
        </header>
        <div className={styles.main}>{children}</div>
      </div>
    </main>
  );
}

export function ClientField({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      {children}
      {hint && !error ? <p className={styles.small}>{hint}</p> : null}
      {error ? <p id={`${id}-error`} className={styles.fieldError}>{error}</p> : null}
    </div>
  );
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const className = status === 'received' ? styles.statusReceived : status === 'in_production' ? styles.statusInProduction : status === 'ready_for_installation' ? styles.statusReady : status === 'delivered' ? styles.statusDelivered : styles.statusCancelled;
  const label = status === 'in_production' ? 'In Production' : status === 'ready_for_installation' ? 'Ready for Installation' : status[0].toUpperCase() + status.slice(1);
  return <span className={`${styles.status} ${className}`}>{label}</span>;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
}

export function formatEighths(value: number) {
  const whole = Math.floor(value / 8);
  const remainder = value % 8;
  const fractions: Record<number, string> = { 1: '⅛', 2: '¼', 3: '⅜', 4: '½', 5: '⅝', 6: '¾', 7: '⅞' };
  return `${whole}${fractions[remainder] ?? ''}"`;
}

export { styles as clientStyles };
