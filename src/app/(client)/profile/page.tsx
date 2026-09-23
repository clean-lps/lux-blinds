import { NotificationPanel } from '@/components/client/notification-panel';
import { ClientShell } from '@/components/client/client-shell';
import { ProfileForm } from '@/components/client/profile-form';
import { pageActor } from '@/server/auth/page-actor';
import { getProfile } from '@/server/profile/service';
import { listNotifications } from '@/server/notifications/service';
import styles from '@/components/client/client-ui.module.css';

export default async function ProfilePage() {
  const actor = await pageActor();
  const [profile, notifications] = await Promise.all([getProfile(actor), listNotifications(actor, {})]);
  const initialNotifications = notifications.data;
  return (
    <ClientShell title="My Profile" description="Manage your customer account and contact information." active="profile">
      <div className={styles.twoColumns}>
        <ProfileForm initialProfile={profile} />
        <aside className={styles.surface} aria-labelledby="account-title">
          <div className={styles.surfaceHeader}><div><h2 id="account-title" className={styles.surfaceTitle}>Account</h2><p className={styles.surfaceIntro}>Account permissions and tax status are managed by LUX Blinds.</p></div></div>
          <div className={styles.list}>
            <div className={styles.listItem}><div className={styles.listItemMain}><strong>Email</strong><p className={styles.listItemMeta}>{profile.email}</p></div><span className={`${styles.badge} ${styles.badgeSuccess}`}>{profile.emailVerified ? 'Verified' : 'Pending'}</span></div>
            <div className={styles.listItem}><div className={styles.listItemMain}><strong>Tax status</strong><p className={styles.listItemMeta}>{profile.taxStatus === 'pending' ? 'Pending review' : profile.taxStatus}</p></div><span className={`${styles.badge} ${styles.badgeNeutral}`}>LUX controlled</span></div>
          </div>

          <div className={styles.sectionBreak} />

          <div className={styles.sectionGroup}><h2 className={styles.sectionGroupTitle}>Updates</h2><p className={styles.sectionGroupIntro}>Opening this panel does not mark notifications read.</p></div>
          <NotificationPanel initialNotifications={initialNotifications} />
        </aside>
      </div>
    </ClientShell>
  );
}
