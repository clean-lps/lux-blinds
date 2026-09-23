'use client';

import Link from 'next/link';
import {useCallback, useEffect, useState, type FormEvent} from 'react';
import {ReviewTaxSchema, type AdminCustomerDTO} from '@/contracts/admin';
import { AttachmentDownload } from '@/components/client/attachment-download';
import {AdminApiRequestError, createAdminApi, createFixtureAdminApi, type AdminApi} from './admin-api';

function taxLabel(status: AdminCustomerDTO['taxStatus']): string {
  return status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending review';
}

export function CustomerDetail({customerId, api: injectedApi, canReviewTax}: {customerId: string;api?: AdminApi;canReviewTax?: boolean}) {
  const [api, setApi] = useState<AdminApi | null>(injectedApi ?? null);
  const [preview, setPreview] = useState(false);
  const [effectiveCanReviewTax, setEffectiveCanReviewTax] = useState(Boolean(canReviewTax));
  const [customer, setCustomer] = useState<AdminCustomerDTO | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (injectedApi) {
      setApi(injectedApi);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const usePreview = process.env.NODE_ENV !== 'production' && params.get('preview') === 'fixtures';
    setPreview(usePreview);
    setEffectiveCanReviewTax(Boolean(canReviewTax) || (usePreview && params.get('role') === 'admin'));
    setApi(usePreview ? createFixtureAdminApi() : createAdminApi());
  }, [canReviewTax, injectedApi]);

  const loadCustomer = useCallback(async () => {
    if (!api) return;
    setState('loading');
    setError(null);
    try {
      const response = await api.getCustomer(customerId);
      setCustomer(response.data);
      setState('ready');
    } catch (cause) {
      setState('error');
      setError(cause instanceof AdminApiRequestError ? cause.message : 'We could not load this customer.');
    }
  }, [api, customerId]);

  useEffect(() => { void loadCustomer(); }, [loadCustomer]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer || !api || !effectiveCanReviewTax || !customer.certificateId) return;
    const parsed = ReviewTaxSchema.safeParse({expectedVersion: customer.revision, status: reviewStatus, certificateId: customer.certificateId, reason});
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setFeedback(issue?.path[0] === 'reason' ? 'Add a review reason before saving.' : issue?.message ?? 'Review the form before saving.');
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const response = await api.reviewTax(customer.id, parsed.data);
      setCustomer(response.data);
      setReason('');
      setFeedback(`Tax documentation ${reviewStatus === 'approved' ? 'approved' : 'rejected'} for this customer.`);
    } catch (cause) {
      setFeedback(cause instanceof AdminApiRequestError && cause.status === 409 ? 'This customer changed in another session. Reload the latest version before reviewing.' : 'The tax review could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (state === 'loading') return <div className="admin-loading" aria-label="Loading customer"><span className="admin-skeleton" /><span className="admin-skeleton" /><span className="admin-skeleton" /></div>;
  if (state === 'error' || !customer) return <div className="admin-alert error" role="alert"><strong>Customer unavailable.</strong><div>{error}</div><button className="admin-button secondary" type="button" onClick={() => void loadCustomer()}>Retry</button></div>;

  return (
    <>
      <header className="admin-page-header"><div><p className="admin-kicker">Customer record</p><h1>{customer.companyName}</h1><p>Profile details and tax documentation for staff review.</p></div><div className="admin-actions"><Link className="admin-button secondary" href={preview ? '/admin-customers?preview=fixtures' : '/admin-customers'}>← All customers</Link></div></header>
      {effectiveCanReviewTax && customer.certificateId ? <AttachmentDownload id={customer.certificateId} name="Open tax certificate" /> : null}
      {feedback && <div className="admin-alert" role="status">{feedback}</div>}
      <div className="admin-detail-grid">
        <div className="admin-stack">
          <section className="admin-card" aria-labelledby="company-heading"><div className="admin-section-heading"><h2 id="company-heading">Company & contact</h2><span className="admin-badge">Revision {customer.revision}</span></div><dl className="admin-definition-list"><div><dt>Company</dt><dd>{customer.companyName}</dd></div><div><dt>Contact</dt><dd>{customer.contactName}</dd></div><div><dt>Email</dt><dd>{customer.email}</dd></div><div><dt>Phone</dt><dd>{customer.phone}</dd></div></dl><div className="admin-item" style={{marginTop: 18}}><strong>Address</strong><p>{customer.address || 'No address on file.'}</p></div></section>
          <section className="admin-card" aria-labelledby="orders-heading"><div className="admin-section-heading"><h2 id="orders-heading">Orders on record</h2><span className="admin-badge">{customer.orderCount} orders</span></div><p>The order list remains the authoritative source for individual order access.</p><div className="admin-actions" style={{marginTop: 16}}><Link className="admin-button secondary" href={preview ? '/admin-orders?preview=fixtures' : '/admin-orders'}>View orders</Link></div></section>
        </div>
        <aside className="admin-card" aria-labelledby="tax-heading"><div className="admin-section-heading"><h2 id="tax-heading">Tax documentation</h2><span className={`admin-badge ${customer.taxStatus === 'approved' ? 'ready' : customer.taxStatus === 'rejected' ? 'rejected' : 'pending'}`}>{taxLabel(customer.taxStatus)}</span></div><p>Certificate access is restricted to authorized administrators. The server must re-check this permission.</p><dl className="admin-stat-grid"><div className="admin-stat"><dt>Certificate ID</dt><dd>{customer.certificateId ? 'Available' : 'Not provided'}</dd></div><div className="admin-stat"><dt>Account email</dt><dd>{customer.emailVerified ? 'Verified' : 'Unverified'}</dd></div><div className="admin-stat"><dt>SMS consent</dt><dd>{customer.smsConsent ? 'Granted' : 'Not granted'}</dd></div></dl>{!effectiveCanReviewTax && <div className="admin-alert warning">Administrator permission required to review tax documentation. This presentation never grants permission by itself.</div>}{effectiveCanReviewTax && <form onSubmit={submitReview}><div className="admin-field"><label htmlFor="tax-status">Decision</label><select id="tax-status" value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value as 'approved' | 'rejected')} disabled={saving || !customer.certificateId}><option value="approved">Approve</option><option value="rejected">Reject</option></select></div><div className="admin-field" style={{marginTop: 14}}><label htmlFor="tax-reason">Review reason</label><textarea id="tax-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Record the decision and evidence reviewed..." required disabled={saving || !customer.certificateId} /></div><div className="admin-dialog-footer"><button className="admin-button" type="submit" disabled={saving || !customer.certificateId}>{saving ? 'Saving…' : 'Save tax review'}</button></div></form>}</aside>
      </div>
    </>
  );
}
