'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';

const LINKS: ReadonlyArray<{label: string; href: string; view?: string}> = [
  {label: 'Orders', href: '/admin-orders'},
  {label: 'Customers', href: '/admin-customers'},
  {label: 'Activity', href: '/admin-orders?view=activity', view: 'activity'},
  {label: 'Notifications', href: '/admin-orders?view=notifications', view: 'notifications'},
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const [view, setView] = useState<string | null>(null);

  useEffect(() => {
    setView(new URLSearchParams(window.location.search).get('view'));
  }, []);

  return <nav className="admin-nav" aria-label="Main navigation">
    {LINKS.map((link) => {
      const current = link.view
        ? pathname === '/admin-orders' && view === link.view
        : link.label === 'Customers'
          ? pathname.startsWith('/admin-customers')
          : pathname.startsWith('/admin-orders') && !view;
      return <Link key={link.label} href={link.href} aria-current={current ? 'page' : undefined}>{link.label}</Link>;
    })}
  </nav>;
}
