import type { ApiError, ApiResponse, ChallengeDTO, LoginInput, RegisterInput, SafeUser, VerifyInput } from '@/contracts';

export type AuthFieldErrors = Record<string, string[]>;

export class AuthApiError extends Error {
  readonly code: string;
  readonly fieldErrors: AuthFieldErrors;
  readonly retryable: boolean;
  readonly status: number;

  constructor({ code, message, fieldErrors, retryable, status }: { code: string; message: string; fieldErrors?: AuthFieldErrors; retryable?: boolean; status: number }) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.fieldErrors = fieldErrors ?? {};
    this.retryable = retryable ?? false;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function readPayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthApiError({ code: 'NETWORK_ERROR', message: 'We could not reach LUX Blinds. Try again.', retryable: true, status: 0 });
  }

  const payload = await readPayload(response);
  if (!response.ok) {
    const envelope = isRecord(payload) && isRecord(payload.error) ? payload as unknown as ApiError : null;
    throw new AuthApiError({
      code: envelope?.error.code ?? 'REQUEST_FAILED',
      message: envelope?.error.message ?? 'We could not complete that request. Try again.',
      fieldErrors: envelope?.error.fieldErrors,
      retryable: envelope?.error.retryable,
      status: response.status,
    });
  }

  if (isRecord(payload) && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
}

export const authApi = {
  login(input: LoginInput) {
    return post<SafeUser>('/auth/login', input);
  },
  register(input: RegisterInput) {
    return post<ChallengeDTO>('/auth/register', input);
  },
  verify(input: VerifyInput) {
    return post<SafeUser>('/auth/verify', input);
  },
  resend(challengeId: string) {
    return post<ChallengeDTO>('/auth/resend', { challengeId });
  },
  forgotPassword(input: { email: string }) {
    return post<void>('/auth/forgot-password', input);
  },
  resetPassword(input: { token: string; newPassword: string; confirmation: string }) {
    return post<void>('/auth/reset-password', input);
  },
  logout() {
    return post<void>('/auth/logout', {});
  },
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError) return error.message;
  return 'We could not complete that request. Try again.';
}

export function getAuthFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof AuthApiError)) return {};
  return Object.fromEntries(Object.entries(error.fieldErrors).map(([key, messages]) => [key, messages[0] ?? 'Invalid value.']));
}
