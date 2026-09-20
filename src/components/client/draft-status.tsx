import { draftStatusLabel, type DraftSyncStatus } from './draft-sync';
import styles from './client-ui.module.css';

export function DraftStatus({ status, revision }: { status: DraftSyncStatus; revision?: number }) {
  return <div className={styles.draftStatus} role="status"><span className={`${styles.badge} ${status === 'error' || status === 'conflict' ? styles.badgeDanger : status === 'saved' ? styles.badgeSuccess : styles.badgeNeutral}`}>{draftStatusLabel(status)}</span>{revision !== undefined ? <span>Revision {revision}</span> : null}</div>;
}
