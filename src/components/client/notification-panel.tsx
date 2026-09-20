'use client';

import { useEffect, useRef, useState } from 'react';
import type { NotificationDTO } from '@/contracts';
import { apiErrorMessage } from './api';
import { clearReadNotifications, getNotifications, markAllNotificationsRead, markNotificationRead } from './account-api';
import { formatDate, type ClientDataMode } from './client-shell';
import styles from './client-ui.module.css';

export function NotificationPanel({ initialNotifications, read = markNotificationRead, readAll = markAllNotificationsRead, clearRead = clearReadNotifications, load = getNotifications }: { initialNotifications: NotificationDTO[]; read?: typeof markNotificationRead; readAll?: typeof markAllNotificationsRead; clearRead?: typeof clearReadNotifications; load?: typeof getNotifications }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [dataMode, setDataMode] = useState<ClientDataMode>('loading');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    load().then((page) => {
      if (!active) return;
      setNotifications(page.data);
      setDataMode('live');
    }).catch((requestError) => {
      if (!active) return;
      setDataMode('preview');
      setError(apiErrorMessage(requestError));
    });
    return () => { active = false; };
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  async function handleRead(id: string) {
    setPending(id);
    setError(null);
    try {
      await read(id);
      setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, readAt: new Date().toISOString() } : notification));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setPending(null);
    }
  }

  async function handleReadAll() {
    setPending('all');
    setError(null);
    const beforeTimestamp = new Date().toISOString();
    try {
      await readAll(beforeTimestamp);
      setNotifications((current) => current.map((notification) => ({ ...notification, readAt: beforeTimestamp })));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setPending(null);
    }
  }

  async function handleClearRead() {
    setPending('clear');
    setError(null);
    try {
      await clearRead(new Date().toISOString());
      setNotifications((current) => current.filter((notification) => !notification.readAt));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setPending(null);
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;
  return (
    <>
      <button ref={triggerRef} className={`${styles.button} ${styles.notificationTrigger}`} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>Notifications{unreadCount ? ` · ${unreadCount}` : ''}</button>
      {open ? <div className={styles.notificationBackdrop} role="presentation"><section className={styles.notificationPanel} role="dialog" aria-modal="true" aria-labelledby="notifications-title"><header className={styles.notificationHeader}><div><h2 id="notifications-title">Notifications</h2><p>Updates about your orders.</p><p className={styles.small}>{dataMode === 'live' ? 'Live notification feed.' : dataMode === 'loading' ? 'Loading notification feed…' : 'Presentation notifications; backend session unavailable.'}</p></div><button ref={closeRef} className={styles.close} type="button" aria-label="Close notifications" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}>×</button></header><div className={styles.notificationBody}>{error ? <div className={styles.error} role="alert"><p>{error}</p></div> : null}{notifications.length ? notifications.map((notification) => <article className={`${styles.notificationItem} ${!notification.readAt ? styles.notificationItemUnread : ''}`} key={notification.id}><strong>{notification.title}</strong><p>{notification.body}</p><p className={styles.small}>{formatDate(notification.createdAt)}{notification.orderId ? ` · order ${notification.orderId.slice(-4)}` : ''}</p>{!notification.readAt ? <button className={styles.buttonSecondary} type="button" disabled={pending !== null} onClick={() => handleRead(notification.id)}>{pending === notification.id ? 'Updating…' : 'Mark as read'}</button> : <span className={styles.badge}>Read</span>}</article>) : <div className={styles.empty}><div><h3 className={styles.emptyTitle}>No notifications yet.</h3><p className={styles.emptyText}>Order updates will appear here.</p></div></div>}</div><footer className={styles.notificationActions}><button className={styles.buttonSecondary} type="button" disabled={pending !== null || !unreadCount} onClick={handleReadAll}>{pending === 'all' ? 'Updating…' : 'Mark all as read'}</button><button className={styles.buttonSecondary} type="button" disabled={pending !== null || notifications.every((notification) => !notification.readAt)} onClick={handleClearRead}>{pending === 'clear' ? 'Clearing…' : 'Clear read'}</button><button className={styles.buttonSecondary} type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}>Close</button></footer></section></div> : null}
    </>
  );
}
