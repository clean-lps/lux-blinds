'use client';

import {useState, type FormEvent} from 'react';
import {ChangeStatusSchema, type AdminOrderDTO} from '@/contracts/admin';
import type {OrderStatus} from '@/contracts/orders';
import {OrderDetailApiRequestError, type OrderDetailApi} from './order-detail-api';

const STATUS_LABELS: Record<OrderStatus, string> = {received: 'Received', in_production: 'In Production', ready_for_installation: 'Ready for Installation', delivered: 'Delivered', cancelled: 'Cancelled'};
import { orderTransitions } from '@/contracts/order-transitions';

export function StatusControl({order, api, onClose, onSaved}: {order: AdminOrderDTO;api: OrderDetailApi;onClose: () => void;onSaved: (order: AdminOrderDTO) => void}) {
  const STATUSES = orderTransitions[order.status];
  const [status, setStatus] = useState<OrderStatus>(order.status === 'received' ? 'in_production' : order.status === 'in_production' ? 'ready_for_installation' : 'delivered');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const terminal = order.status === 'delivered' || order.status === 'cancelled';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = ChangeStatusSchema.safeParse({expectedVersion: order.revision, status, reason: reason.trim() || undefined});
    if (!parsed.success) {
      setError(status === 'cancelled' ? 'A cancellation reason is required.' : 'Review the status change before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await api.changeStatus(order.id, parsed.data);
      onSaved(response.data);
    } catch (cause) {
      setError(cause instanceof OrderDetailApiRequestError && cause.status === 409 ? 'This order changed in another session. Your reason is still here; reload before applying it.' : 'The status change could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="admin-dialog-backdrop" role="presentation"><section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="status-dialog-title"><header><div><h2 id="status-dialog-title">Change order status</h2><p> {order.number} · Revision {order.revision}</p></div><button className="admin-dialog-close" type="button" aria-label="Close status dialog" onClick={onClose}>×</button></header>{terminal ? <div className="admin-alert warning">This order is terminal ({STATUS_LABELS[order.status]}). No further status changes are available.</div> : <form onSubmit={submit}><div className="admin-field"><label htmlFor="current-status">Current status</label><input id="current-status" value={STATUS_LABELS[order.status]} disabled /></div><div className="admin-field" style={{marginTop: 14}}><label htmlFor="next-status">New status</label><select id="next-status" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)} disabled={saving}>{STATUSES.filter((item) => item !== order.status).map((item) => <option key={item} value={item}>{STATUS_LABELS[item]}</option>)}</select></div><div className="admin-field" style={{marginTop: 14}}><label htmlFor="status-reason">Reason {status === 'cancelled' ? '(required)' : '(optional)'}</label><textarea id="status-reason" value={reason} onChange={(event) => setReason(event.target.value)} aria-invalid={Boolean(error)} placeholder="Add production or cancellation details..." disabled={saving} /></div>{error && <div className="admin-alert error" role="alert">{error}</div>}<p className="admin-note">The server validates the state graph, version and permission before recording the change.</p><div className="admin-dialog-footer"><button className="admin-button secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button><button className="admin-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Confirm status'}</button></div></form>}</section></div>;
}
