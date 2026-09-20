'use client';

import Link from 'next/link';
import {useCallback, useEffect, useState, type FormEvent} from 'react';
import type {AdminOrderDTO} from '@/contracts/admin';
import type {OrderStatus} from '@/contracts/orders';
import {AdminApiRequestError, createAdminApi, createFixtureAdminApi, type AdminApi} from './admin-api';

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Received',
  in_production: 'In Production',
  ready_for_installation: 'Ready for Installation',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function statusClass(status: OrderStatus): string {
  return status === 'in_production' ? 'in-production' : status === 'ready_for_installation' ? 'ready' : status;
}

function orderHref(id: string, preview: boolean): string {
  return preview ? `/admin-orders/${id}?preview=fixtures` : `/admin-orders/${id}`;
}

function OrderStatusBadge({status}: {status: OrderStatus}) {
  return <span className={`admin-badge ${statusClass(status)}`}>{STATUS_LABELS[status]}</span>;
}

function OrderSummary({order}: {order: AdminOrderDTO}) {
  const curtains = order.items.reduce((total, item) => total + item.quantity, 0);
  return <>{order.items.length} {order.items.length === 1 ? 'model' : 'models'} · {curtains} {curtains === 1 ? 'curtain' : 'curtains'}</>;
}

export function OrderList({api: injectedApi}: {api?: AdminApi}) {
  const [api, setApi] = useState<AdminApi | null>(injectedApi ?? null);
  const [preview, setPreview] = useState(false);
  const [query, setQuery] = useState({q: '', status: '' as '' | OrderStatus, cursor: ''});
  const [draftQuery, setDraftQuery] = useState({q: '', status: '' as '' | OrderStatus});
  const [orders, setOrders] = useState<AdminOrderDTO[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (injectedApi) {
      setApi(injectedApi);
      return;
    }
    const usePreview = new URLSearchParams(window.location.search).get('preview') === 'fixtures';
    setPreview(usePreview);
    setApi(usePreview ? createFixtureAdminApi() : createAdminApi());
  }, [injectedApi]);

  const loadOrders = useCallback(async () => {
    if (!api) return;
    setState('loading');
    setError(null);
    try {
      const response = await api.listOrders({q: query.q || undefined, status: query.status || undefined, cursor: query.cursor || undefined, limit: 20});
      setOrders(response.data);
      setNextCursor(response.page.nextCursor);
      setState('ready');
    } catch (cause) {
      setState('error');
      setError(cause instanceof AdminApiRequestError ? cause.message : 'We could not load orders. Try again.');
    }
  }, [api, query]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery({...draftQuery, cursor: ''});
  }

  const hasResults = state === 'ready' && orders.length > 0;

  return (
    <>
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">LUX Blinds · Administration</p>
          <h1>Orders</h1>
          <p>Review measurements, coordinate production and keep customers informed.</p>
        </div>
        <div className="admin-actions"><span className="admin-badge">Staff view</span></div>
      </header>

      <section className="admin-hero" aria-label="Orders overview">
        <div>
          <h2>Every order, ready for the next step.</h2>
          <p>Server-side permissions and status rules remain authoritative for every action.</p>
        </div>
        {preview ? <span className="admin-badge">MOCK DATA · PREVIEW</span> : <span className="admin-badge">Live API</span>}
      </section>

      <section className="admin-card" aria-labelledby="orders-heading">
        <div className="admin-card-header">
          <div><h2 id="orders-heading">All orders</h2><p className="admin-muted">{state === 'ready' ? `${orders.length} result${orders.length === 1 ? '' : 's'}` : 'Loading current results'}</p></div>
        </div>
        <form className="admin-toolbar" onSubmit={submitSearch}>
          <div className="admin-field"><label htmlFor="order-search">Search orders</label><input id="order-search" value={draftQuery.q} onChange={(event) => setDraftQuery({...draftQuery, q: event.target.value})} placeholder="Order number, customer or sidemark" /></div>
          <div className="admin-field"><label htmlFor="order-status">Status</label><select id="order-status" value={draftQuery.status} onChange={(event) => setDraftQuery({...draftQuery, status: event.target.value as '' | OrderStatus})}><option value="">All statuses</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <button className="admin-button" type="submit">Filter</button>
        </form>

        {state === 'loading' && <div className="admin-loading" aria-label="Loading orders"><span className="admin-skeleton" /><span className="admin-skeleton" /><span className="admin-skeleton" /></div>}
        {state === 'error' && <div className="admin-alert error" role="alert"><strong>Orders are unavailable.</strong><div>{error}</div><button className="admin-button secondary" type="button" onClick={() => void loadOrders()}>Retry</button></div>}
        {state === 'ready' && !hasResults && <div className="admin-empty"><h3>No orders match these filters.</h3><p>Try a different customer, sidemark or status.</p><button className="admin-button secondary" type="button" onClick={() => {setDraftQuery({q: '', status: ''});setQuery({q: '', status: '', cursor: ''});}}>Clear filters</button></div>}
        {hasResults && <>
          <div className="admin-table-wrap">
            <table className="admin-table"><caption className="admin-visually-hidden">Orders</caption><thead><tr><th>Order</th><th>Customer / sidemark</th><th>Submitted</th><th>Models</th><th>Status</th><th><span className="admin-visually-hidden">Actions</span></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.number}</strong><small>Revision {order.revision}</small></td><td>{order.customerName}<small>{order.sidemark}</small></td><td>{new Date(order.submittedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}</td><td><OrderSummary order={order} /></td><td><OrderStatusBadge status={order.status} /></td><td><Link className="admin-button secondary" href={orderHref(order.id, preview)}>Open</Link></td></tr>)}</tbody></table>
          </div>
          <div className="admin-item-row" style={{marginTop: 18}}><small className="admin-muted">Showing {orders.length} result{orders.length === 1 ? '' : 's'}</small><div className="admin-actions"><button className="admin-button secondary" type="button" disabled>Previous</button><button className="admin-button secondary" type="button" disabled={!nextCursor} onClick={() => setQuery({...query, cursor: nextCursor ?? ''})}>Next</button></div></div>
          <div className="admin-mobile-list">{orders.map((order) => <article className="admin-item" key={order.id}><div className="admin-item-row"><strong>{order.number}</strong><OrderStatusBadge status={order.status} /></div><p>{order.customerName}<br /><span className="admin-muted">{order.sidemark} · <OrderSummary order={order} /></span></p><div className="admin-item-row" style={{marginTop: 12}}><small>Revision {order.revision}</small><Link className="admin-button secondary" href={orderHref(order.id, preview)}>Open order</Link></div></article>)}</div>
        </>}
      </section>
    </>
  );
}
