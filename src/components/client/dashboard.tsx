'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { DashboardDTO } from '@/contracts';
import { apiErrorMessage } from './api';
import { getDashboard } from './query-api';
import { ClientShell, formatDate, StatusPill, type ClientDataMode } from './client-shell';
import styles from './client-ui.module.css';

export function Dashboard({ data: initialData }: { data: DashboardDTO }) {
  const [data, setData] = useState(initialData);
  const [dataMode, setDataMode] = useState<ClientDataMode>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getDashboard().then((next) => {
      if (!active) return;
      setData(next);
      setDataMode('live');
      setLoadError(null);
    }).catch((error) => {
      if (!active) return;
      setDataMode('error');
      setLoadError(apiErrorMessage(error));
    });
    return () => { active = false; };
  }, []);

  return (
    <ClientShell title="Client Dashboard" description="Welcome to your account" active="dashboard" dataMode={dataMode}>
      {loadError ? <div className={styles.error} role="alert"><p>Could not refresh your orders. {loadError}</p></div> : null}

      <section className={styles.hero}>
        <div>
          <h2>Manage your orders in one place.</h2>
          <p>Submit new orders, review recent activity and check production status.</p>
        </div>
        <div className={styles.heroActions}>
          <Link className={styles.button} href="/new-order">+ New Order</Link>
          <Link className={styles.buttonSecondary} href="/order-history">Order History</Link>
        </div>
      </section>

      {data.draft ? (
        <section className={styles.draft}>
          <div>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Saved draft</span>
            <h2 className={styles.draftTitle}>Continue your unfinished order</h2>
            <p className={styles.draftMeta}>{data.draft.modelCount} added models · revision {data.draft.revision}</p>
          </div>
          <Link className={styles.button} href={`/new-order?draft=${encodeURIComponent(data.draft.id)}`}>Continue Draft</Link>
        </section>
      ) : null}

      <section className={styles.metricGrid} aria-label="Order summary">
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Total orders</span>
          <strong className={styles.metricValue}>{data.counts.total}</strong>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Received</span>
          <strong className={styles.metricValue}>{data.counts.received}</strong>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>In Production</span>
          <strong className={styles.metricValue}>{data.counts.inProduction}</strong>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Completed</span>
          <strong className={styles.metricValue}>{data.counts.completed}</strong>
        </div>
      </section>

      <section className={styles.surface} aria-labelledby="recent-orders-title">
        <div className={styles.surfaceHeader}>
          <div>
            <h2 id="recent-orders-title" className={styles.surfaceTitle}>Recent Orders</h2>
            <p className={styles.surfaceIntro}>Your latest submitted orders and their current status.</p>
          </div>
          <Link className={styles.buttonSecondary} href="/order-history">View history</Link>
        </div>
        {data.recentOrders.length ? (
          <ul className={styles.list}>
            {data.recentOrders.map((order) => (
              <li className={styles.listItem} key={order.id}>
                <div className={styles.listItemMain}>
                  <h3 className={styles.listItemTitle}><Link href={`/orders/${order.id}`}>{order.number}</Link></h3>
                  <p className={styles.listItemMeta}>
                    <span>{order.sidemark}</span>
                    <span>{formatDate(order.submittedAt)}</span>
                    <span>{order.items.length} model{order.items.length === 1 ? '' : 's'}</span>
                  </p>
                </div>
                <StatusPill status={order.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <div>
              <h3 className={styles.emptyTitle}>No orders yet.</h3>
              <p className={styles.emptyText}>Create your first order and it will appear here with its status and details.</p>
              <Link className={styles.button} href="/new-order">+ New Order</Link>
            </div>
          </div>
        )}
        <p className={styles.sourceNote}>Completed orders have been delivered.</p>
      </section>
    </ClientShell>
  );
}
