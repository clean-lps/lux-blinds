'use client';

import Link from 'next/link';
import {useCallback, useEffect, useState, type FormEvent} from 'react';
import type {AdminCustomerDTO} from '@/contracts/admin';
import {AdminApiRequestError, createAdminApi, createFixtureAdminApi, type AdminApi} from './admin-api';

function taxLabel(status: AdminCustomerDTO['taxStatus']): string {
  return status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending review';
}

function taxClass(status: AdminCustomerDTO['taxStatus']): string {
  return status === 'approved' ? 'ready' : status === 'rejected' ? 'rejected' : 'pending';
}

export function CustomerList({api: injectedApi}: {api?: AdminApi}) {
  const [api, setApi] = useState<AdminApi | null>(injectedApi ?? null);
  const [preview, setPreview] = useState(false);
  const [draftQuery, setDraftQuery] = useState('');
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<AdminCustomerDTO[]>([]);
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

  const loadCustomers = useCallback(async () => {
    if (!api) return;
    setState('loading');
    setError(null);
    try {
      const response = await api.listCustomers({q: query || undefined, limit: 20});
      setCustomers(response.data);
      setState('ready');
    } catch (cause) {
      setState('error');
      setError(cause instanceof AdminApiRequestError ? cause.message : 'We could not load customers. Try again.');
    }
  }, [api, query]);

  useEffect(() => { void loadCustomers(); }, [loadCustomers]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(draftQuery.trim());
  }

  return (
    <>
      <header className="admin-page-header">
        <div><p className="admin-kicker">LUX Blinds · Administration</p><h1>Customers</h1><p>Keep customer records clear while protecting certificates and staff-only fields.</p></div>
        <div className="admin-actions"><span className="admin-badge">Staff view</span></div>
      </header>
      <section className="admin-card" aria-labelledby="customers-heading">
        <div className="admin-card-header"><div><h2 id="customers-heading">Customer records</h2><p className="admin-muted">Customer data is filtered by server-side staff permissions.</p></div>{preview && <span className="admin-badge">MOCK DATA · PREVIEW</span>}</div>
        <form className="admin-toolbar" onSubmit={submitSearch}><div className="admin-field"><label htmlFor="customer-search">Search customers</label><input id="customer-search" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Company, contact or email" /></div><button className="admin-button" type="submit">Search</button></form>
        {state === 'loading' && <div className="admin-loading" aria-label="Loading customers"><span className="admin-skeleton" /><span className="admin-skeleton" /></div>}
        {state === 'error' && <div className="admin-alert error" role="alert"><strong>Customers are unavailable.</strong><div>{error}</div><button className="admin-button secondary" type="button" onClick={() => void loadCustomers()}>Retry</button></div>}
        {state === 'ready' && customers.length === 0 && <div className="admin-empty"><h3>No customers match this search.</h3><p>Try a company name, contact or email.</p><button className="admin-button secondary" type="button" onClick={() => {setDraftQuery('');setQuery('');}}>Clear search</button></div>}
        {state === 'ready' && customers.length > 0 && <>
          <div className="admin-table-wrap"><table className="admin-table"><caption className="admin-visually-hidden">Customers</caption><thead><tr><th>Company</th><th>Contact</th><th>Orders</th><th>Tax documentation</th><th><span className="admin-visually-hidden">Actions</span></th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><strong>{customer.companyName}</strong><small>{customer.email}</small></td><td>{customer.contactName}<small>{customer.phone}</small></td><td>{customer.orderCount}</td><td><span className={`admin-badge ${taxClass(customer.taxStatus)}`}>{taxLabel(customer.taxStatus)}</span></td><td><Link className="admin-button secondary" href={preview ? `/admin-customers/${customer.id}?preview=fixtures&role=admin` : `/admin-customers/${customer.id}`}>Open</Link></td></tr>)}</tbody></table></div>
          <div className="admin-mobile-list">{customers.map((customer) => <article className="admin-item" key={customer.id}><div className="admin-item-row"><strong>{customer.companyName}</strong><span className={`admin-badge ${taxClass(customer.taxStatus)}`}>{taxLabel(customer.taxStatus)}</span></div><p>{customer.contactName}<br /><span className="admin-muted">{customer.email} · {customer.orderCount} orders</span></p><div className="admin-item-row" style={{marginTop: 12}}><small>{customer.phone}</small><Link className="admin-button secondary" href={preview ? `/admin-customers/${customer.id}?preview=fixtures&role=admin` : `/admin-customers/${customer.id}`}>Open customer</Link></div></article>)}</div>
        </>}
      </section>
    </>
  );
}
