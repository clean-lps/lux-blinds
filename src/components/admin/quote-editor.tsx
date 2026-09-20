'use client';

import {useState} from 'react';
import {CreateQuoteSchema, type AdminOrderDTO} from '@/contracts/admin';
import {OrderDetailApiRequestError, type OrderDetailApi} from './order-detail-api';

function toMinor(value: string): string | null {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  return (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0') || '0')).toString();
}

function fromMinor(value: string, currency: string): string {
  try {
    const minor = BigInt(value);
    return `${currency} ${(minor / 100n).toString()}.${(minor % 100n).toString().padStart(2, '0')}`;
  } catch {
    return `${currency} —`;
  }
}

function inputFromMinor(value: string): string {
  try {
    const minor = BigInt(value);
    return `${(minor / 100n).toString()}.${(minor % 100n).toString().padStart(2, '0')}`;
  } catch {
    return '0.00';
  }
}

export function QuoteEditor({order, api, onClose, onReload}: {order: AdminOrderDTO;api: OrderDetailApi;onClose: () => void;onReload: () => Promise<void>}) {
  const previous = order.quotes[0] ?? order.publishedQuote;
  const [currency, setCurrency] = useState(previous?.currency ?? 'USD');
  const [amount, setAmount] = useState(previous ? inputFromMinor(previous.amountMinor) : '0.00');
  const [notes, setNotes] = useState(previous?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function save(publish: boolean) {
    const amountMinor = toMinor(amount);
    const parsed = CreateQuoteSchema.safeParse({expectedVersion: order.revision, currency: currency.trim().toUpperCase(), amountMinor: amountMinor ?? '', notes});
    if (!parsed.success) {
      setFeedback('Enter a three-letter currency, a non-negative amount and valid quote notes.');
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const created = await api.createQuote(order.id, parsed.data);
      if (publish) {
        const latest = await api.getOrder(order.id);
        await api.publishQuote(created.data.id, latest.data.revision);
      }
      await onReload();
      setFeedback(publish ? `Quote published: ${fromMinor(parsed.data.amountMinor, parsed.data.currency)}.` : `Quote draft saved: ${fromMinor(parsed.data.amountMinor, parsed.data.currency)}.`);
      if (publish) setConfirmPublish(false);
    } catch (cause) {
      setFeedback(cause instanceof OrderDetailApiRequestError && cause.status === 409 ? 'A newer order version exists. Reload before saving this quote.' : 'The quote could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="admin-dialog-backdrop" role="presentation"><section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="quote-dialog-title"><header><div><h2 id="quote-dialog-title">Prepare quote</h2><p>{order.number} · Manual pricing</p></div><button className="admin-dialog-close" type="button" aria-label="Close quote dialog" onClick={onClose}>×</button></header><form onSubmit={(event) => {event.preventDefault(); void save(false)}}><div className="admin-form-grid"><div className="admin-field"><label htmlFor="quote-currency">Currency</label><input id="quote-currency" value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} maxLength={3} placeholder="USD" disabled={saving} /></div><div className="admin-field"><label htmlFor="quote-amount">Amount</label><input id="quote-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" disabled={saving} /><small className="admin-muted">Sent as integer minor units; no float is sent to the server.</small></div><div className="admin-field full"><label htmlFor="quote-notes">Quote notes</label><textarea id="quote-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Explain the confirmed amount..." disabled={saving} /></div></div>{feedback && <div className="admin-alert" role="status">{feedback}</div>}<div className="admin-alert warning"><strong>No automatic tax calculation.</strong><div>Confirm amount and currency before publishing. Publishing creates a new visible quote version; it does not change production status.</div></div>{confirmPublish && <div className="admin-alert"><strong>Publish this quote?</strong><div>{currency.toUpperCase()} {amount || '0.00'} will become the customer-visible quote.</div><div className="admin-dialog-footer"><button className="admin-button secondary" type="button" onClick={() => setConfirmPublish(false)} disabled={saving}>Keep editing</button><button className="admin-button" type="button" onClick={() => void save(true)} disabled={saving}>Confirm and publish</button></div></div>}<div className="admin-dialog-footer"><button className="admin-button secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button><button className="admin-button secondary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save draft'}</button><button className="admin-button" type="button" onClick={() => setConfirmPublish(true)} disabled={saving}>Publish quote</button></div></form></section></div>;
}
