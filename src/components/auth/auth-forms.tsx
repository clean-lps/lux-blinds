'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifySchema,
  type ChallengeDTO,
  type LoginInput,
  type RegisterInput,
  type SafeUser,
} from '@/contracts';
import { authApi, getAuthErrorMessage, getAuthFieldErrors } from './api';
import { postVerificationPath } from './redirects';
import styles from './auth-forms.module.css';

type SubmitState = 'idle' | 'pending' | 'success' | 'error';
type FieldErrors = Record<string, string>;

function zodFieldErrors(error: { issues: Array<{ path: PropertyKey[]; message: string }> }): FieldErrors {
  return Object.fromEntries(error.issues.map((issue) => [String(issue.path[0] ?? 'form'), issue.message]));
}

function useAutofillSync(ref: React.RefObject<HTMLInputElement | null>, onSync: (value: string) => void) {
  return {
    onAnimationStart(event: React.AnimationEvent<HTMLInputElement>) {
      if (event.animationName === 'onAutoFillStart') {
        onSync(event.currentTarget.value);
      }
    },
    onFocus(event: React.FocusEvent<HTMLInputElement>) {
      if (event.currentTarget.matches(':-webkit-autofill')) {
        onSync(event.currentTarget.value);
      }
    },
  };
}

function AuthNotice() {
  return (
    <div className={styles.notice} role="status">
      <span>Mock data · presentation only · no production connection</span>
      <Link href="/login">Sign in</Link>
    </div>
  );
}

export function AuthFrame({ title, description, children, footer, wide = false, photo = false, align = 'center' }: { title: string; description: string; children: ReactNode; footer: ReactNode; wide?: boolean; photo?: boolean; align?: 'start' | 'center' | 'end' }) {
  const alignClass = align === 'start' ? styles.alignStart : align === 'end' ? styles.alignEnd : '';
  return (
    <main className={`${styles.page} ${photo ? styles.pagePhoto : ''}`}>
      <div className={`${styles.layout} ${alignClass}`}>
        <section className={`${styles.card} ${wide ? styles.cardWide : ''}`} aria-labelledby="auth-title">
          <div className={styles.brand} aria-label="LUX Blinds">
            <strong>LUX</strong>
            <span>BLINDS</span>
          </div>
          <h1 id="auth-title" className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
          {children}
          <div className={styles.footer}>{footer}</div>
        </section>
      </div>
    </main>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error ? <p className={styles.hint}>{hint}</p> : null}
      {error ? <p id={`${id}-error`} className={styles.fieldMessage}>{error}</p> : null}
    </div>
  );
}

function ErrorSummary({ message }: { message: string | null }) {
  return message ? <div className={styles.error} role="alert"><p>{message}</p></div> : null;
}

function FieldIcon({ kind }: { kind: 'email' | 'lock' }) {
  return kind === 'email' ? (
    <svg className={styles.fieldIcon} aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ) : (
    <svg className={styles.fieldIcon} aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
    </svg>
  );
}

const PasswordField = forwardRef<HTMLInputElement, { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; autoComplete?: string; autofill?: { onAnimationStart: (e: React.AnimationEvent<HTMLInputElement>) => void; onFocus: (e: React.FocusEvent<HTMLInputElement>) => void } }>(function PasswordField({ id, label, value, onChange, error, autoComplete, autofill }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} error={error}>
      <div className={styles.passwordWrap}>
        <FieldIcon kind="lock" />
<input
           id={id}
           ref={ref}
           className={styles.input}
           type={visible ? 'text' : 'password'}
           value={value}
           onChange={(event) => onChange(event.target.value)}
           autoComplete={autoComplete}
           placeholder="Enter your password"
           aria-invalid={Boolean(error)}
           aria-describedby={error ? `${id}-error` : undefined}
           {...autofill}
         />
        <button type="button" className={styles.togglePassword} aria-pressed={visible} onClick={() => setVisible((current) => !current)}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </Field>
  );
});

function SubmitButton({ children, pending }: { children: ReactNode; pending: boolean }) {
  return <button className={styles.button} type="submit" disabled={pending}>{pending ? 'Please wait…' : children}</button>;
}

export function LoginForm({ submit = authApi.login }: { submit?: (input: LoginInput) => Promise<SafeUser> }) {
  const router = useRouter();
  const [values, setValues] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailAutofill = useAutofillSync(emailRef, (v) => setValues((current) => ({ ...current, email: v })));
  const passwordAutofill = useAutofillSync(passwordRef, (v) => setValues((current) => ({ ...current, password: v })));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFieldErrors({});
    const result = LoginSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      setMessage('Check the highlighted fields and try again.');
      setState('error');
      return;
    }
    setState('pending');
    try {
      const user = await submit(result.data);
      setState('success');
      // Force a document navigation so the freshly-issued auth cookie is sent
      // through the proxy before rendering the protected panel.
      window.location.assign(user.role === 'admin' ? '/admin-orders' : '/my-panel');
    } catch (error) {
      setState('error');
      setMessage(getAuthErrorMessage(error));
      setFieldErrors(getAuthFieldErrors(error));
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <ErrorSummary message={message} />
<Field id="email" label="Email Address" error={fieldErrors.email}>
         <div className={styles.iconInput}>
           <FieldIcon kind="email" />
           <input id="email" ref={emailRef} className={styles.input} type="email" value={values.email} placeholder="Enter your email" onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} {...emailAutofill} />
         </div>
       </Field>
      <PasswordField ref={passwordRef} id="password" label="Password" value={values.password} onChange={(password) => setValues((current) => ({ ...current, password }))} error={fieldErrors.password} autoComplete="current-password" autofill={passwordAutofill} />
      <SubmitButton pending={state === 'pending'}>Sign In</SubmitButton>
      <div className={styles.links}>
        <Link className={styles.link} href="/register">Create a new account</Link>
        <Link className={styles.link} href="/forgot-password">Forgot your password?</Link>
      </div>
      {state === 'success' ? <div className={styles.success} role="status"><p>Signed in. Opening your dashboard…</p></div> : null}
    </form>
  );
}

type RegisterFormValues = RegisterInput & { taxId: string; certificateFile: File | null; termsAccepted: boolean };

const initialRegisterValues: RegisterFormValues = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  taxId: '',
  taxExempt: false,
  certificateId: undefined,
  termsVersion: '2026-09',
  smsConsent: false,
  verificationMethod: 'email',
  certificateFile: null,
  termsAccepted: false,
};

export function RegisterForm({ submit = authApi.register }: { submit?: (input: RegisterInput) => Promise<ChallengeDTO> }) {
  const router = useRouter();
  const [values, setValues] = useState<RegisterFormValues>(initialRegisterValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');

  const companyRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const taxIdRef = useRef<HTMLInputElement>(null);

  const companyAutofill = useAutofillSync(companyRef, (v) => update('companyName', v));
  const contactAutofill = useAutofillSync(contactRef, (v) => update('contactName', v));
  const emailAutofill = useAutofillSync(emailRef, (v) => update('email', v));
  const phoneAutofill = useAutofillSync(phoneRef, (v) => update('phone', v));
  const taxIdAutofill = useAutofillSync(taxIdRef, (v) => update('taxId', v));

  function update<K extends keyof RegisterFormValues>(key: K, value: RegisterFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFieldErrors({});
    const nextErrors: FieldErrors = {};
    if (!values.termsAccepted) nextErrors.termsAccepted = 'You must accept the terms to create an account.';
    if (values.taxExempt && !values.certificateFile) nextErrors.certificateFile = 'A certificate is required for tax-exempt registration.';
    const { certificateFile: _certificateFile, termsAccepted: _termsAccepted, ...payload } = values;
    const result = RegisterSchema.safeParse(payload);
    if (!result.success) Object.assign(nextErrors, zodFieldErrors(result.error));
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setMessage('Check the highlighted fields and try again.');
      setState('error');
      return;
    }
    if (!result.success) return;
    setState('pending');
    try {
      const challenge = await submit(result.data);
      setState('success');
      router.push(`/verify?challengeId=${encodeURIComponent(challenge.challengeId)}&destination=${encodeURIComponent(challenge.maskedDestination)}`);
    } catch (error) {
      setState('error');
      setMessage(getAuthErrorMessage(error));
      setFieldErrors(getAuthFieldErrors(error));
    }
  }

  function handleCertificate(event: ChangeEvent<HTMLInputElement>) {
    update('certificateFile', event.target.files?.[0] ?? null);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <ErrorSummary message={message} />
      <div className={styles.twoColumns}>
        <Field id="companyName" label="Company Name" error={fieldErrors.companyName}>
          <input id="companyName" ref={companyRef} className={styles.input} value={values.companyName} placeholder="Enter value" onChange={(event) => update('companyName', event.target.value)} autoComplete="organization" aria-invalid={Boolean(fieldErrors.companyName)} aria-describedby={fieldErrors.companyName ? 'companyName-error' : undefined} {...companyAutofill} />
        </Field>
        <Field id="contactName" label="Contact Name" error={fieldErrors.contactName}>
          <input id="contactName" ref={contactRef} className={styles.input} value={values.contactName} placeholder="Enter value" onChange={(event) => update('contactName', event.target.value)} autoComplete="name" aria-invalid={Boolean(fieldErrors.contactName)} aria-describedby={fieldErrors.contactName ? 'contactName-error' : undefined} {...contactAutofill} />
        </Field>
        <Field id="registerEmail" label="Email Address" error={fieldErrors.email}>
          <input id="registerEmail" ref={emailRef} className={styles.input} type="email" value={values.email} placeholder="Enter value" onChange={(event) => update('email', event.target.value)} autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'registerEmail-error' : undefined} {...emailAutofill} />
        </Field>
        <Field id="phone" label="Phone Number" error={fieldErrors.phone}>
          <input id="phone" ref={phoneRef} className={styles.input} type="tel" value={values.phone} placeholder="Enter value" onChange={(event) => update('phone', event.target.value)} autoComplete="tel" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'phone-error' : undefined} {...phoneAutofill} />
        </Field>
      </div>

      <fieldset className={styles.choiceGroup}>
        <legend className={styles.legend}>Verification method</legend>
        <p className={styles.info}>We will send a verification code to your email address.</p>
      </fieldset>

      <Field id="taxId" label="Company Tax ID (optional)" error={fieldErrors.taxId}>
        <input id="taxId" ref={taxIdRef} className={styles.input} value={values.taxId} placeholder="Enter value" onChange={(event) => update('taxId', event.target.value)} autoComplete="off" aria-invalid={Boolean(fieldErrors.taxId)} aria-describedby={fieldErrors.taxId ? 'taxId-error' : undefined} {...taxIdAutofill} />
      </Field>

      <fieldset className={styles.choiceGroup}>
        <legend className={styles.legend}>Tax exemption</legend>
        <label className={styles.checkChoice}><input className={styles.checkbox} type="checkbox" checked={values.taxExempt} onChange={(event) => update('taxExempt', event.target.checked)} /> This company is tax exempt.</label>
        {values.taxExempt ? (
          <Field id="certificateFile" label="Tax-exempt certificate" error={fieldErrors.certificateFile} hint="PDF, JPG, JPEG or PNG. Private storage connection pending.">
            <input id="certificateFile" className={styles.file} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleCertificate} aria-invalid={Boolean(fieldErrors.certificateFile)} aria-describedby={fieldErrors.certificateFile ? 'certificateFile-error' : undefined} />
          </Field>
        ) : null}
      </fieldset>

      <div className={styles.twoColumns}>
        <PasswordField id="registerPassword" label="Password" value={values.password} onChange={(password) => update('password', password)} error={fieldErrors.password} autoComplete="new-password" />
        <PasswordField id="confirmPassword" label="Confirm Password" value={values.confirmPassword} onChange={(confirmPassword) => update('confirmPassword', confirmPassword)} error={fieldErrors.confirmPassword} autoComplete="new-password" />
      </div>

      <label className={styles.checkChoice}>
        <input className={styles.checkbox} type="checkbox" checked={values.termsAccepted} onChange={(event) => update('termsAccepted', event.target.checked)} aria-invalid={Boolean(fieldErrors.termsAccepted)} />
        I agree to the LUX Blinds terms of service.
      </label>
      {fieldErrors.termsAccepted ? <p className={styles.fieldMessage}>{fieldErrors.termsAccepted}</p> : null}
      <SubmitButton pending={state === 'pending'}>Create Account</SubmitButton>
      {state === 'success' ? <div className={styles.success} role="status"><p>Account request accepted. Opening verification…</p></div> : null}
    </form>
  );
}

export function VerificationForm({ challengeId = '', maskedDestination = 'your selected destination', verify = authApi.verify, resend = authApi.resend }: { challengeId?: string; maskedDestination?: string; verify?: typeof authApi.verify; resend?: typeof authApi.resend }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFieldErrors({});
    const result = VerifySchema.safeParse({ challengeId, code });
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      setMessage('Enter the six-digit code to continue.');
      setState('error');
      return;
    }
    setState('pending');
    try {
      await verify(result.data);
      setState('success');
      setTimeout(() => router.push(postVerificationPath()), 1200);
    } catch (error) {
      setState('idle');
      setMessage(getAuthErrorMessage(error));
      setFieldErrors(getAuthFieldErrors(error));
    }
  }

  async function handleResend() {
    if (!challengeId || cooldown > 0) return;
    setMessage(null);
    setFieldErrors({});
    setState('pending');
    try {
      const challenge = await resend(challengeId);
      setCooldown(60);
      setState('idle');
      setMessage(`A new code was sent to ${challenge.maskedDestination}.`);
    } catch (error) {
      setState('idle');
      setMessage(getAuthErrorMessage(error));
    }
  }

  const isLoading = state === 'pending';
  const isSuccess = state === 'success';

  return (
    <form className={styles.form} onSubmit={handleVerify} noValidate>
      <div className={styles.info}><p>Enter the 6-digit code sent to {maskedDestination}. Codes expire after 10 minutes.</p></div>
      <ErrorSummary message={message} />
      <Field id="verificationCode" label="Verification Code" error={fieldErrors.code}>
        <input id="verificationCode" ref={codeRef} className={styles.codeInput} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} placeholder="0 0 0 0 0 0" onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} disabled={isLoading || isSuccess} aria-invalid={Boolean(fieldErrors.code)} aria-describedby={fieldErrors.code ? 'verificationCode-error' : undefined} />
      </Field>
      <SubmitButton pending={isLoading}>Verify Account</SubmitButton>
      <div className={styles.buttonRow}>
        <button type="button" className={styles.buttonSecondary} disabled={!challengeId || cooldown > 0 || isLoading || isSuccess} onClick={handleResend}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}</button>
      </div>
      {isSuccess && !message ? <div className={styles.success} role="status"><p>Verification complete. Opening sign in…</p></div> : null}
    </form>
  );
}

export function ForgotPasswordForm({ submit = authApi.forgotPassword }: { submit?: (input: { email: string }) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');
  const emailRef = useRef<HTMLInputElement>(null);
  const emailAutofill = useAutofillSync(emailRef, setEmail);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFieldErrors({});
    const result = ForgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      setMessage('Enter a valid email address.');
      setState('error');
      return;
    }
    setState('pending');
    try {
      await submit(result.data);
    } catch {
      // The public recovery response stays generic even when the account is unknown.
    }
    setState('success');
    setMessage('If an account exists for this email, a recovery link will arrive shortly.');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <ErrorSummary message={state === 'error' ? message : null} />
      {state === 'success' ? <div className={styles.success} role="status"><p>{message}</p></div> : null}
      <Field id="recoveryEmail" label="Email Address" error={fieldErrors.email}>
        <input id="recoveryEmail" ref={emailRef} className={styles.input} type="email" value={email} placeholder="Enter value" onChange={(event) => setEmail(event.target.value)} autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'recoveryEmail-error' : undefined} {...emailAutofill} />
      </Field>
      <SubmitButton pending={state === 'pending'}>Send Recovery Link</SubmitButton>
      <Link className={styles.link} href="/login">Back to Sign In</Link>
    </form>
  );
}

export function ResetPasswordForm({ token = '', submit = authApi.resetPassword }: { token?: string; submit?: (input: { token: string; newPassword: string; confirmation: string }) => Promise<void> }) {
  const router = useRouter();
  const [values, setValues] = useState({ newPassword: '', confirmation: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFieldErrors({});
    const result = ResetPasswordSchema.safeParse({ token, ...values });
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      setMessage('Check the highlighted fields and try again.');
      setState('error');
      return;
    }
    setState('pending');
    try {
      await submit(result.data);
      setState('success');
      router.push('/login');
    } catch (error) {
      setState('error');
      setMessage(getAuthErrorMessage(error));
      setFieldErrors(getAuthFieldErrors(error));
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <ErrorSummary message={message} />
      <PasswordField id="newPassword" label="New Password" value={values.newPassword} onChange={(newPassword) => setValues((current) => ({ ...current, newPassword }))} error={fieldErrors.newPassword} autoComplete="new-password" />
      <PasswordField id="resetConfirmation" label="Confirm New Password" value={values.confirmation} onChange={(confirmation) => setValues((current) => ({ ...current, confirmation }))} error={fieldErrors.confirmation} autoComplete="new-password" />
      <SubmitButton pending={state === 'pending'}>Reset Password</SubmitButton>
      {state === 'success' ? <div className={styles.success} role="status"><p>Password updated. Returning to sign in…</p></div> : null}
      <Link className={styles.link} href="/login">Back to Sign In</Link>
    </form>
  );
}
