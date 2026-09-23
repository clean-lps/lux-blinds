'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ClientOrderDTO, OrderStatus } from '@/contracts';
import { apiErrorMessage, buildQuery } from './api';
import { getOrders } from './query-api';
import { ClientField, ClientShell, formatDate, StatusPill, type ClientDataMode } from './client-shell';
import styles from './client-ui.module.css';

export const historyStatuses: OrderStatus[] = ['received', 'in_production', 'ready_for_installation', 'delivered', 'cancelled'];

export function filterOrders(orders: ClientOrderDTO[], query: string, status: OrderStatus | '') {
  const normalized = query.trim().toLowerCase();
  return orders.filter((order) => (!normalized || `${order.number} ${order.sidemark}`.toLowerCase().includes(normalized)) && (!status || order.status === status));
}

function readUrlFilters() {
  if (typeof window === 'undefined') return { query: '', status: '' as OrderStatus | '' };
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const selectedStatus: OrderStatus | '' = historyStatuses.includes(status as OrderStatus) ? status as OrderStatus : '';
  return { query: params.get('q') ?? '', status: selectedStatus };
}

export function OrderHistory({ orders: initialOrders }: { orders: ClientOrderDTO[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [dataMode, setDataMode] = useState<ClientDataMode>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [applied, setApplied] = useState({ query: '', status: '' as OrderStatus | '' });
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    const initial = readUrlFilters();
    setQuery(initial.query);
    setStatus(initial.status);
    setApplied(initial);
  }, []);

  useEffect(() => {
    let active = true;
    setDataMode('loading');
    getOrders({ q: applied.query || undefined, status: applied.status || undefined, cursor: cursor ?? undefined, limit: 50 }).then((page) => {
      if (!active) return;
      setOrders(page.data);
      setNextCursor(page.page.nextCursor);
      setDataMode('live');
      setLoadError(null);
    }).catch((error) => {
      if (!active) return;
      setDataMode('error');
      setLoadError(apiErrorMessage(error));
    });
    return () => { active = false; };
  }, [applied, cursor]);

  const filtered = useMemo(() => filterOrders(orders, applied.query, applied.status), [orders, applied]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = { query: query.trim(), status };
    setApplied(next);
    setCursor(null);
    window.history.replaceState(null, '', `/order-history${buildQuery({ q: next.query || undefined, status: next.status || undefined })}`);
  }

  return (
    <ClientShell title="Order History" description="View, search and track your submitted orders." active="history" dataMode={dataMode}>
      {loadError ? <div className={styles.error} role="alert"><p>{loadError}</p><button type="button" onClick={() => setApplied({ ...applied })}>Retry</button></div> : null}

      <section className={styles.surface}>
        <div className={styles.surfaceHeader}>
          <div>
            <h2 className={styles.surfaceTitle}>All Orders</h2>
            <p className={styles.surfaceIntro}>Use filters to find an order quickly.</p>
          </div>
          <Link className={styles.button} href="/new-order">+ New Order</Link>
        </div>

        <form className={styles.filterBar} onSubmit={handleSubmit}>
          <ClientField id="orderSearch" label="Search">
            <input className={styles.input} id="orderSearch" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by order number or sidemark" />
          </ClientField>
          <ClientField id="orderStatus" label="Status">
            <select className={styles.select} id="orderStatus" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | '')}>
              <option value="">All Statuses</option>
              {historyStatuses.map((option) => (
                <option key={option} value={option}>{option === 'in_production' ? 'In Production' : option === 'ready_for_installation' ? 'Ready for Installation' : option[0].toUpperCase() + option.slice(1)}</option>
              ))}
            </select>
          </ClientField>
          <button className={styles.button} type="submit">Filter</button>
        </form>

        <div className={styles.choiceRow} aria-label="Available statuses">
          {historyStatuses.map((option) => <StatusPill key={option} status={option} />)}
        </div>

        {dataMode === 'loading' ? <p role="status">Loading orders…</p> : dataMode === 'error' ? null : filtered.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Sidemark</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Models</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td data-label="Order"><Link href={`/orders/${order.id}`}>{order.number}</Link></td>
                    <td data-label="Sidemark">{order.sidemark}</td>
                    <td data-label="Status"><StatusPill status={order.status} /></td>
                    <td data-label="Submitted">{formatDate(order.submittedAt)}</td>
                    <td data-label="Models">{order.items.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>
            <div>
              <h3 className={styles.emptyTitle}>{applied.query || applied.status ? 'No matching orders.' : 'No orders yet.'}</h3>
              <p className={styles.emptyText}>{applied.query || applied.status ? 'Try another order number, sidemark or status.' : 'Create your first order and it will appear here with its status and details.'}</p>
              {!applied.query && !applied.status ? <Link className={styles.button} href="/new-order">+ New Order</Link> : null}
            </div>
          </div>
        )}

        <div className={styles.buttonRow}>
          {cursor ? <button type="button" className={styles.buttonSecondary} disabled={dataMode === 'loading'} onClick={() => setCursor(null)}>First page</button> : null}
          {nextCursor ? <button type="button" className={styles.buttonSecondary} disabled={dataMode === 'loading'} onClick={() => setCursor(nextCursor)}>Next page</button> : null}
        </div>
      </section>
    </ClientShell>
  );
}
