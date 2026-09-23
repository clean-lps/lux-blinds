'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ClientOrderDTO } from '@/contracts';
import { apiErrorMessage } from './api';
import { getOrder } from './query-api';
import { ClientShell, formatDate, formatEighths, StatusPill, type ClientDataMode } from './client-shell';
import styles from './client-ui.module.css';
import { AttachmentDownload } from './attachment-download';

export function OrderDetail({ order: initialOrder, orderId }: { order?: ClientOrderDTO; orderId: string }) {
  const [order, setOrder] = useState(initialOrder ?? null);
  const [dataMode, setDataMode] = useState<ClientDataMode>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getOrder(orderId).then((next) => {
      if (!active) return;
      setOrder(next);
      setDataMode('live');
      setLoadError(null);
    }).catch((error) => {
      if (!active) return;
      setDataMode('error');
      setLoadError(apiErrorMessage(error));
    });
    return () => { active = false; };
  }, [orderId]);

  if (!order) {
    return <ClientShell title="Order details" description="View order status and submitted models." active="history" dataMode={dataMode}><section className={styles.surface}><h2 className={styles.surfaceTitle}>Order unavailable</h2><p className={styles.surfaceIntro}>{loadError ? `The backend could not load this order: ${loadError}` : 'Loading order details…'}</p><Link className={styles.buttonSecondary} href="/order-history">Back to Order History</Link></section></ClientShell>;
  }

  const totalQuantity = order.items.reduce((total, item) => total + item.quantity, 0);
  return (
    <ClientShell title={order.number} description={`Order ${order.sidemark} · submitted ${formatDate(order.submittedAt)}`} active="history" dataMode={dataMode}>
      {loadError ? <div className={styles.error} role="alert"><p>{loadError}</p></div> : null}
      <section className={styles.surface}>
        <div className={styles.surfaceHeader}><div><p className={styles.eyebrow}>Order details</p><h2 className={styles.surfaceTitle}>{order.sidemark}</h2><p className={styles.surfaceIntro}>{totalQuantity} total units across {order.items.length} model{order.items.length === 1 ? '' : 's'}.</p></div><StatusPill status={order.status} /></div>
        <div className={styles.list}>{order.items.map((item) => <article className={styles.listItem} key={item.id}><div className={styles.listItemMain}><h3 className={styles.listItemTitle}>{item.productType} · {item.fabricName}</h3><p className={styles.listItemMeta}>{item.quantity} units · {formatEighths(item.widthEighths)} W × {formatEighths(item.heightEighths)} H · {item.installation ?? 'Installation pending'} · {item.operation ?? 'Operation pending'}</p>{item.snapsManual ? <p className={styles.small}>Manual snaps: {item.snapsManual}</p> : item.snapsSuggested ? <p className={styles.small}>Snaps: {item.snapsSuggested} · {item.snapsSource === 'auto' ? 'server suggestion' : 'manual'} · rule {item.ruleVersion}</p> : <p className={styles.small}>Snaps not applicable or pending server calculation.</p>}</div></article>)}</div>
        <div className={styles.sectionBreak} />
        <div className={styles.twoColumns}><div><h3>Photos</h3>{order.attachments.length ? order.attachments.map(file => <AttachmentDownload key={file.id} id={file.id} name={file.name} />) : <p>No photos attached.</p>}</div><div><h3>Published quote</h3><p className={styles.surfaceIntro}>{order.publishedQuote ? new Intl.NumberFormat('en-US', {style:'currency',currency:order.publishedQuote.currency}).format(Number(order.publishedQuote.amountMinor)/100) : 'No published quote yet.'}</p>{order.publishedQuote?.notes ? <p>{order.publishedQuote.notes}</p> : null}</div></div>
        {order.specialNotes ? <div className={styles.info}><p><strong>Special notes</strong><br />{order.specialNotes}</p></div> : null}
        <p className={styles.sourceNote}>This view uses ClientOrderDTO only. Internal notes and staff audit data are never rendered for the client.</p>
        <Link className={styles.buttonSecondary} href="/order-history">Back to Order History</Link>
      </section>
    </ClientShell>
  );
}
