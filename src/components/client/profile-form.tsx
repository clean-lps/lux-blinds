'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { UpdateProfileSchema, type ProfileDTO } from '@/contracts';
import { apiErrorMessage, ClientApiError } from './api';
import { changePassword, getProfile, updateConsent, updateProfile } from './account-api';
import { ClientField } from './client-shell';
import styles from './client-ui.module.css';
import { uploadFile } from './upload-file';

type FormErrors = Record<string, string>;

function schemaErrors(error: { issues: Array<{ path: PropertyKey[]; message: string }> }): FormErrors {
  return Object.fromEntries(error.issues.map((issue) => [String(issue.path[0] ?? 'form'), issue.message]));
}

function apiFieldErrors(error: unknown): FormErrors {
  if (!(error instanceof ClientApiError)) return {};
  return Object.fromEntries(Object.entries(error.fieldErrors).map(([key, values]) => [key, values[0] ?? 'Invalid value.']));
}

export function ProfileForm({ initialProfile }: { initialProfile: ProfileDTO }) {
  const [profile, setProfile] = useState(initialProfile);
  const [values, setValues] = useState({ companyName: initialProfile.companyName, contactName: initialProfile.contactName, phone: initialProfile.phone, address: initialProfile.address });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmation: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(initialProfile.smsConsent);
  const [smsPending, setSmsPending] = useState(false);
  const [certificateName, setCertificateName] = useState<string | null>(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  useEffect(() => {
    let active = true;
    getProfile().then((live) => {
      if (!active) return;
      setProfile(live);
      setValues({ companyName: live.companyName, contactName: live.contactName, phone: live.phone, address: live.address });
      setSmsEnabled(live.smsConsent);
    }).catch(error => { if (active) setMessage(apiErrorMessage(error)); });
    return () => { active = false; };
  }, []);

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setMessage(null);
    const result = UpdateProfileSchema.safeParse({ ...values, expectedVersion: profile.revision });
    if (!result.success) {
      setErrors(schemaErrors(result.error));
      setMessage('Check the highlighted fields and try again.');
      return;
    }
    setSaving(true);
    try {
      setProfile(await updateProfile(result.data));
      setMessage('Profile saved.');
    } catch (error) {
      setMessage(apiErrorMessage(error));
      setErrors(apiFieldErrors(error));
    } finally {
      setSaving(false);
    }
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage(null);
    if (passwords.newPassword.length < 12) {
      setPasswordMessage('New password must be at least 12 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmation) {
      setPasswordMessage('Passwords must match.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '', confirmation: '' });
      window.location.assign('/login');
    } catch (error) {
      setPasswordMessage(apiErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSms() {
    setSmsPending(true);
    setMessage(null);
    try {
      await updateConsent({ channel: 'sms', granted: !smsEnabled, wordingVersion: '2026-09' });
      setSmsEnabled((current) => !current);
      setMessage('SMS consent updated.');
    } catch (error) {
      setMessage(apiErrorMessage(error));
    } finally {
      setSmsPending(false);
    }
  }

  async function handleCertificate(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || file.size > 10_000_000 || !file.size) { setMessage('Choose a PDF, JPG or PNG up to 10 MB.'); return; }
    setUploadingCertificate(true);
    try { await uploadFile(file, 'tax_certificate'); setCertificateName(file.name); setProfile(await getProfile()); setMessage('Certificate uploaded.'); }
    catch (error) { setMessage(apiErrorMessage(error)); }
    finally { setUploadingCertificate(false); event.target.value = ''; }
  }

  return (
    <section className={styles.surface} aria-labelledby="profile-form-title">
      <div className={styles.surfaceHeader}><div><h2 id="profile-form-title" className={styles.surfaceTitle}>Contact information</h2><p className={styles.surfaceIntro}>Keep your company and contact details current.</p></div><span className={styles.badge}>Revision {profile.revision}</span></div>
      {message ? <div className={message === 'Profile saved.' || message === 'Certificate uploaded.' ? styles.success : styles.error} role="status"><p>{message}</p></div> : null}
      <form id="profile-form" className={styles.form} onSubmit={handleProfile} noValidate>
        <div className={styles.twoColumns}>
          <ClientField id="profileCompany" label="Company Name *" error={errors.companyName}><input className={styles.input} id="profileCompany" value={values.companyName} onChange={(event) => setValues((current) => ({ ...current, companyName: event.target.value }))} autoComplete="organization" aria-invalid={Boolean(errors.companyName)} /></ClientField>
          <ClientField id="profileContact" label="Contact Name *" error={errors.contactName}><input className={styles.input} id="profileContact" value={values.contactName} onChange={(event) => setValues((current) => ({ ...current, contactName: event.target.value }))} autoComplete="name" aria-invalid={Boolean(errors.contactName)} /></ClientField>
          <ClientField id="profileEmail" label="Email *" hint="Email changes require a separate reauthentication and verification flow."><input className={styles.input} id="profileEmail" value={profile.email} readOnly aria-readonly="true" /></ClientField>
          <ClientField id="profilePhone" label="Phone *" error={errors.phone}><input className={styles.input} id="profilePhone" value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} autoComplete="tel" aria-invalid={Boolean(errors.phone)} /></ClientField>
        </div>
        <ClientField id="profileAddress" label="Address" error={errors.address}><textarea className={styles.textarea} id="profileAddress" value={values.address} onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))} maxLength={1000} /></ClientField>
      </form>

      <div className={styles.sectionBreak} />

      <div className={styles.sectionGroup}><h2 className={styles.sectionGroupTitle}>Change Password</h2><p className={styles.sectionGroupIntro}>Leave these fields blank if you do not want to change it.</p></div>
      {passwordMessage ? <div className={passwordMessage.includes('updated') ? styles.success : styles.error} role="status"><p>{passwordMessage}</p></div> : null}
      <form className={styles.form} onSubmit={handlePassword} noValidate>
        <div className={styles.twoColumns}>
          <ClientField id="currentPassword" label="Current Password"><input className={styles.input} id="currentPassword" type="password" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} autoComplete="current-password" /></ClientField>
          <ClientField id="newPassword" label="New Password"><input className={styles.input} id="newPassword" type="password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} autoComplete="new-password" /></ClientField>
        </div>
        <ClientField id="confirmNewPassword" label="Confirm New Password"><input className={styles.input} id="confirmNewPassword" type="password" value={passwords.confirmation} onChange={(event) => setPasswords((current) => ({ ...current, confirmation: event.target.value }))} autoComplete="new-password" /></ClientField>
        <button className={styles.buttonSecondary} type="submit" disabled={savingPassword}>{savingPassword ? 'Updating…' : 'Update Password'}</button>
      </form>

      <div className={styles.sectionBreak} />

      <div className={styles.sectionGroup}><h2 className={styles.sectionGroupTitle}>Tax Exempt Certificate</h2><p className={styles.sectionGroupIntro}>{uploadingCertificate ? 'Uploading…' : certificateName ?? (profile.certificateId ? 'Certificate on file' : 'No certificate uploaded')}</p></div>
      <input className={styles.file} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" disabled={uploadingCertificate} onChange={handleCertificate} aria-label="Choose tax exempt certificate" />
      <p className={styles.small}>PDF, JPG or PNG. Maximum 10 MB. Tax status remains controlled by LUX Blinds.</p>

      <div className={styles.sectionBreak} />

      <div className={styles.buttonRow}><span className={styles.spacer} /><button className={styles.button} type="submit" form="profile-form" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button></div>
      <p className={styles.sourceNote}>Sensitive changes are sent with the profile revision; a 409 conflict must be reloaded before editing again.</p>
    </section>
  );
}
