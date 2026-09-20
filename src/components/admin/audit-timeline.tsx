import type {AuditDTO} from '@/contracts/admin';

function displayValue(value: unknown): string {
  if (typeof value === 'string') return value.replaceAll('_', ' ');
  if (value === null || value === undefined) return '—';
  return JSON.stringify(value);
}

export function AuditTimeline({audit}: {audit: AuditDTO[]}) {
  if (audit.length === 0) return <div className="admin-empty"><h3>No activity recorded.</h3><p>Server audit events will appear here after the order changes.</p></div>;
  return <ol className="admin-timeline">{audit.map((event) => <li key={event.id}><strong>{event.action}</strong><p>{Object.entries(event.changes).map(([field, change]) => <span key={field}>{field}: {displayValue(change.before)} → {displayValue(change.after)}<br /></span>)}</p><small>{event.actorName} · {new Date(event.createdAt).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC'})} · Revision {event.revision}{event.reason ? ` · ${event.reason}` : ''}</small></li>)}</ol>;
}
