'use client';

import Link from 'next/link';
import {useCallback, useEffect, useState, type FormEvent} from 'react';
import type {AdminOrderDTO} from '@/contracts/admin';
import type {OrderStatus} from '@/contracts/orders';
import {OrderDetailApiRequestError, createFixtureOrderDetailApi, createOrderDetailApi, type OrderDetailApi} from './order-detail-api';
import {AuditTimeline} from './audit-timeline';
import {OrderCorrection} from './order-correction';
import {QuoteEditor} from './quote-editor';
import {StatusControl} from './status-control';

const STATUS_LABELS: Record<OrderStatus, string> = {received: 'Received', in_production: 'In Production', ready_for_installation: 'Ready for Installation', delivered: 'Delivered', cancelled: 'Cancelled'};

function statusClass(status: OrderStatus): string {
  return status === 'in_production' ? 'in-production' : status === 'ready_for_installation' ? 'ready' : status;
}

export function formatEighths(value: number): string {
  const whole = Math.floor(value / 8);
  const fraction = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'][value % 8];
  return `${whole}${fraction ? ` ${fraction}` : ''} in`;
}

function formatMinor(value: string, currency: string): string {
  try {
    const minor = BigInt(value);
    return `${currency} ${(minor / 100n).toString()}.${(minor % 100n).toString().padStart(2, '0')}`;
  } catch {
    return `${currency} —`;
  }
}

function OrderStatusBadge({status}: {status: OrderStatus}) {
  return <span className={`admin-badge ${statusClass(status)}`}>{STATUS_LABELS[status]}</span>;
}

function measurementSummary(item: AdminOrderDTO['items'][number]): string {
  return `${formatEighths(item.widthEighths)} × ${formatEighths(item.heightEighths)}`;
}

export function OrderDetail({orderId, api: injectedApi}: {orderId: string;api?: OrderDetailApi}) {
  const [api, setApi] = useState<OrderDetailApi | null>(injectedApi ?? null);
  const [preview, setPreview] = useState(false);
  const [order, setOrder] = useState<AdminOrderDTO | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<'status' | 'correction' | 'quote' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteState, setNoteState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [attachmentLoading, setAttachmentLoading] = useState<string | null>(null);

  useEffect(() => {
    if (injectedApi) {
      setApi(injectedApi);
      return;
    }
    const usePreview = process.env.NODE_ENV !== 'production' && new URLSearchParams(window.location.search).get('preview') === 'fixtures';
    setPreview(usePreview);
    setApi(usePreview ? createFixtureOrderDetailApi() : createOrderDetailApi());
  }, [injectedApi]);

  const reload = useCallback(async () => {
    if (!api) return;
    setState('loading');
    setError(null);
    try {
      const response = await api.getOrder(orderId);
      setOrder(response.data);
      setState('ready');
    } catch (cause) {
      setState('error');
      setError(cause instanceof OrderDetailApiRequestError ? cause.message : 'We could not load this order.');
    }
  }, [api, orderId]);

  useEffect(() => { void reload(); }, [reload]);

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!api || !order || !noteText.trim()) {
      setNoteState('error');
      return;
    }
    setNoteState('saving');
    try {
      const response = await api.addNote(order.id, noteText.trim());
      setOrder({...order, internalNotes: [...order.internalNotes, response.data]});
      setNoteText('');
      setNoteState('idle');
      setFeedback('Internal note saved for staff.');
    } catch {
      setNoteState('error');
    }
  }

  async function downloadAttachment(id: string) {
    if (!api) return;
    setAttachmentLoading(id);
    try {
      const response = await api.downloadAttachment(id);
      if (preview) setFeedback('Preview only — private file access is not connected to a storage provider.');
      else if (response.data.url) window.open(response.data.url, '_blank', 'noopener,noreferrer');
    } catch (cause) {
      setFeedback(cause instanceof OrderDetailApiRequestError ? cause.message : 'The file could not be opened.');
    } finally {
      setAttachmentLoading(null);
    }
  }

  if (state === 'loading') return <div className="admin-loading" aria-label="Loading order"><span className="admin-skeleton" /><span className="admin-skeleton" /><span className="admin-skeleton" /><span className="admin-skeleton" /></div>;
  if (state === 'error' || !order) return <div className="admin-alert error" role="alert"><strong>Order unavailable.</strong><div>{error}</div><button className="admin-button secondary" type="button" onClick={() => void reload()}>Retry</button></div>;

  const terminal = order.status === 'delivered' || order.status === 'cancelled';
  const latestQuote = order.publishedQuote ?? order.quotes[0] ?? null;

  return <>
    <header className="admin-page-header"><div><p className="admin-kicker">Order detail · Staff review</p><h1>{order.number}</h1><p>{order.customerName} · {order.sidemark}</p></div><div className="admin-actions"><OrderStatusBadge status={order.status} /><Link className="admin-button secondary" href={preview ? '/admin-orders?preview=fixtures' : '/admin-orders'}>← All orders</Link>{!terminal && <button className="admin-button secondary" type="button" onClick={() => setDialog('status')}>Change status</button>}<button className="admin-button" type="button" onClick={() => setDialog('quote')}>Prepare quote</button></div></header>
    {preview && <div className="admin-alert warning" role="status"><strong>MOCK DATA · INFERRED ADMIN TARGET.</strong><div>Actions below use an explicit local fixture adapter and do not persist to the backend.</div></div>}
    {feedback && <div className="admin-alert" role="status">{feedback}</div>}
    <dl className="admin-definition-list admin-card"><div><dt>Customer</dt><dd>{order.customerName}</dd></div><div><dt>Sidemark</dt><dd>{order.sidemark}</dd></div><div><dt>Submitted</dt><dd>{new Date(order.submittedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}</dd></div><div><dt>Revision</dt><dd>{order.revision}</dd></div></dl>
    <div className="admin-detail-grid">
      <div className="admin-stack">
        <section className="admin-card" aria-labelledby="models-heading"><div className="admin-section-heading"><div><h2 id="models-heading">Models & measurements</h2><p>Server-calculated rules remain authoritative.</p></div><button className="admin-button secondary" type="button" onClick={() => setDialog('correction')} disabled={terminal}>Edit models</button></div><div className="admin-measurements-wrap"><table className="admin-measurements"><caption className="admin-visually-hidden">Models and measurements</caption><thead><tr><th>Model</th><th>Fabric</th><th>Measurements</th><th>Quantity</th><th>Track</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id}><td><strong>{item.productType}</strong><small>{item.opening ?? 'Opening not specified'}</small></td><td><strong>{item.fabricName}</strong><small>{item.fullness ?? 'Fullness not specified'}</small></td><td><strong>{measurementSummary(item)}</strong><small>{item.installation ?? 'Installation not specified'}</small></td><td>{item.quantity}</td><td>{item.trackSupplied ? item.track ?? 'Supplied' : 'Not supplied'}</td></tr>)}</tbody></table></div></section>
        <section className="admin-card" aria-labelledby="files-heading"><div className="admin-section-heading"><div><h2 id="files-heading">Files</h2><p>Private files · access checked before download.</p></div></div>{order.attachments.length === 0 && <div className="admin-empty"><h3>No files attached.</h3><p>Uploaded order files will appear here after scanning.</p></div>}{order.attachments.map((attachment) => <div className="admin-item" key={attachment.id}><div className="admin-item-row"><div><strong>{attachment.name}</strong><small>{attachment.mediaType} · {Math.round(attachment.byteSize / 1024)} KB · {attachment.scanStatus === 'clean' ? 'Clean' : attachment.scanStatus}</small></div><button className="admin-button secondary" type="button" onClick={() => void downloadAttachment(attachment.id)} disabled={attachmentLoading === attachment.id || attachment.scanStatus !== 'clean'}>{attachmentLoading === attachment.id ? 'Opening…' : attachment.mediaType.startsWith('image/') ? 'Preview' : 'Download'}</button></div></div>)}</section>
      </div>
      <aside className="admin-stack">
        <section className="admin-card" aria-labelledby="notes-heading"><div className="admin-section-heading"><div><h2 id="notes-heading">Internal notes</h2><p>Visible to staff only.</p></div></div>{order.internalNotes.length === 0 && <p className="admin-muted">No internal notes yet.</p>}{order.internalNotes.map((note) => <div className="admin-item" key={note.id}><strong>{note.text}</strong><small>{note.authorName} · {new Date(note.createdAt).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC'})}</small></div>)}<form onSubmit={addNote} style={{marginTop: 18}}><div className="admin-field"><label htmlFor="internal-note">New note</label><textarea id="internal-note" value={noteText} onChange={(event) => {setNoteText(event.target.value);setNoteState('idle')}} placeholder="Write an internal note..." aria-invalid={noteState === 'error'} disabled={noteState === 'saving'} /></div>{noteState === 'error' && <div className="admin-alert error" role="alert">Write a note before saving.</div>}<div className="admin-actions" style={{marginTop: 12}}><button className="admin-button" type="submit" disabled={noteState === 'saving'}>{noteState === 'saving' ? 'Saving…' : 'Add note'}</button></div></form></section>
        <section className="admin-card" aria-labelledby="quote-heading"><div className="admin-section-heading"><div><h2 id="quote-heading">Quote</h2><p>Manual pricing only; no automatic tax or payment.</p></div></div>{order.publishedQuote ? <div className="admin-alert"><strong>Published · {formatMinor(order.publishedQuote.amountMinor, order.publishedQuote.currency)}</strong><div>{order.publishedQuote.notes || 'No quote notes.'}</div></div> : latestQuote ? <div className="admin-alert warning"><strong>Draft · {formatMinor(latestQuote.amountMinor, latestQuote.currency)}</strong><div>{latestQuote.notes || 'No quote notes.'}</div></div> : <p>No published quote.</p>}<div className="admin-actions" style={{marginTop: 14}}><button className="admin-button secondary" type="button" onClick={() => setDialog('quote')}>{order.publishedQuote ? 'Prepare new version' : 'Prepare quote'}</button></div></section>
        <section className="admin-card" aria-labelledby="activity-heading"><div className="admin-section-heading"><div><h2 id="activity-heading">Recent activity</h2><p>Changes include actor, timestamp, revision and reason.</p></div></div><AuditTimeline audit={order.audit.slice(0, 4)} /><div className="admin-actions" style={{marginTop: 16}}><Link className="admin-button secondary" href={preview ? `/admin-orders/${order.id}?preview=fixtures&view=audit` : `/admin-orders/${order.id}?view=audit`}>View full history</Link></div></section>
      </aside>
    </div>
    {dialog === 'status' && <StatusControl order={order} api={api!} onClose={() => setDialog(null)} onSaved={(updated) => {setOrder(updated);setDialog(null);setFeedback('Order status saved in the current server revision.')}} />}
    {dialog === 'correction' && <OrderCorrection order={order} api={api!} onClose={() => setDialog(null)} onSaved={(updated) => {setOrder(updated);setDialog(null);setFeedback('Order correction saved and added to the audit trail.')}} onReload={reload} />}
    {dialog === 'quote' && <QuoteEditor order={order} api={api!} onClose={() => setDialog(null)} onReload={reload} />}
  </>;
}
