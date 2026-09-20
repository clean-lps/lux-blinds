'use client';

import {useState, type FormEvent} from 'react';
import {CorrectOrderSchema, type AdminOrderDTO} from '@/contracts/admin';
import type {OrderItemInput} from '@/contracts/product-rules';
import {OrderDetailApiRequestError, type OrderDetailApi} from './order-detail-api';

function formatEighths(value: number): string {
  const whole = Math.floor(value / 8);
  const remainder = value % 8;
  const fraction = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'][remainder];
  return `${whole}${fraction ? ` ${fraction}` : ''} in`;
}

function toOrderItem(item: AdminOrderDTO['items'][number]): OrderItemInput {
  const {id: _id, snapsSuggested: _snapsSuggested, snapsSource: _snapsSource, ruleVersion: _ruleVersion, ...input} = item;
  return input;
}

export function OrderCorrection({order, api, onClose, onSaved, onReload}: {order: AdminOrderDTO;api: OrderDetailApi;onClose: () => void;onSaved: (order: AdminOrderDTO) => void;onReload: () => Promise<void>}) {
  const firstItem = order.items[0];
  const [sidemark, setSidemark] = useState(order.sidemark);
  const [widthEighths, setWidthEighths] = useState(String(firstItem?.widthEighths ?? ''));
  const [heightEighths, setHeightEighths] = useState(String(firstItem?.heightEighths ?? ''));
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const width = Number(widthEighths);
    const height = Number(heightEighths);
    const items = order.items.map((item, index) => ({...toOrderItem(item), ...(index === 0 ? {widthEighths: width, heightEighths: height} : {})}));
    const parsed = CorrectOrderSchema.safeParse({expectedVersion: order.revision, sidemark: sidemark.trim() || undefined, items, reason: reason.trim()});
    if (!parsed.success) {
      setError(parsed.error.issues.some((issue) => issue.path[0] === 'reason') ? 'Add a reason for the correction.' : 'Enter valid positive eighths for width and height.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await api.correctOrder(order.id, parsed.data);
      onSaved(response.data);
    } catch (cause) {
      setError(cause instanceof OrderDetailApiRequestError && cause.status === 409 ? 'This order changed in another session. Your reason is still here; reload the latest measurements before applying it.' : 'The correction could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="admin-dialog-backdrop" role="presentation"><section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="correction-dialog-title"><header><div><h2 id="correction-dialog-title">Correct order</h2><p>{order.number} · Server revision {order.revision}</p></div><button className="admin-dialog-close" type="button" aria-label="Close correction dialog" onClick={onClose}>×</button></header><form onSubmit={submit}><div className="admin-form-grid"><div className="admin-field full"><label htmlFor="correction-sidemark">Sidemark</label><input id="correction-sidemark" value={sidemark} onChange={(event) => setSidemark(event.target.value)} disabled={saving} /></div>{firstItem && <><div className="admin-field"><label htmlFor="correction-width">Width (eighths)</label><input id="correction-width" type="number" min="1" step="1" value={widthEighths} onChange={(event) => setWidthEighths(event.target.value)} disabled={saving} /><small className="admin-muted">Currently {formatEighths(firstItem.widthEighths)}</small></div><div className="admin-field"><label htmlFor="correction-height">Height (eighths)</label><input id="correction-height" type="number" min="1" step="1" value={heightEighths} onChange={(event) => setHeightEighths(event.target.value)} disabled={saving} /><small className="admin-muted">Currently {formatEighths(firstItem.heightEighths)}</small></div></>}</div><div className="admin-field" style={{marginTop: 14}}><label htmlFor="correction-reason">Reason (required)</label><textarea id="correction-reason" value={reason} onChange={(event) => setReason(event.target.value)} aria-invalid={Boolean(error)} placeholder="Explain the confirmed correction..." disabled={saving} /></div>{error && <div className="admin-alert error" role="alert">{error}</div>}<p className="admin-note">The server recalculates product rules and preserves the previous revision in the audit trail.</p><div className="admin-dialog-footer"><button className="admin-button secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button><button className="admin-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save correction'}</button></div></form>{error?.includes('changed in another session') && <div className="admin-actions" style={{marginTop: 10}}><button className="admin-button secondary" type="button" onClick={() => void onReload()}>Load latest version</button></div>}</section></div>;
}
