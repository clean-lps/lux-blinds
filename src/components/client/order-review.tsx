'use client';

import { useEffect, useRef } from 'react';
import type { AttachmentDTO, OrderItemInput } from '@/contracts';
import { formatEighths } from './client-shell';
import styles from './client-ui.module.css';

export function OrderReview({ open, sidemark, items, notes, attachments, error, submitting, onClose, onSubmit }: { open: boolean; sidemark: string; items: Array<{ id: string; item: OrderItemInput }>; notes: string; attachments: AttachmentDTO[]; error: string | null; submitting: boolean; onClose: () => void; onSubmit: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, submitting]);

  if (!open) return null;
  const totalQuantity = items.reduce((total, entry) => total + entry.item.quantity, 0);
  return (
    <div className={styles.reviewBackdrop} role="presentation">
      <section className={styles.review} role="dialog" aria-modal="true" aria-labelledby="order-review-title">
        <header className={styles.reviewHeader}>
          <div><h2 id="order-review-title">Review order</h2><p>Confirm the details before sending the order.</p></div>
          <button ref={closeRef} className={styles.close} type="button" disabled={submitting} aria-label="Close review" onClick={onClose}>×</button>
        </header>
        <div className={styles.reviewBody}>
          {error ? <div className={styles.error} role="alert"><p>{error}</p></div> : null}
          <div className={styles.reviewRow}><strong>Sidemark</strong><p>{sidemark || 'Not provided'}</p></div>
          <div className={styles.reviewRow}><strong>Models · {totalQuantity} total units</strong>{items.map(({ id, item }) => <p key={id}>{item.quantity} × {item.productType} · {formatEighths(item.widthEighths)} W × {formatEighths(item.heightEighths)} H{item.snapsManual ? ` · Manual snaps: ${item.snapsManual}` : ' · snaps calculated by server'}</p>)}</div>
          <div className={styles.reviewRow}><strong>Photos</strong><p>{attachments.length ? `${attachments.length} selected for private upload` : 'No photos selected'}</p></div>
          {notes ? <div className={styles.reviewRow}><strong>Special notes</strong><p>{notes}</p></div> : null}
        </div>
        <footer className={styles.reviewFooter}>
          <button className={styles.buttonSecondary} type="button" disabled={submitting} onClick={onClose}>Keep editing</button>
          <button className={styles.button} type="button" disabled={submitting || !items.length || !sidemark.trim()} onClick={onSubmit}>{submitting ? 'Submitting…' : 'Submit order'}</button>
        </footer>
      </section>
    </div>
  );
}
