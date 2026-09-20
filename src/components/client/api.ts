import type { ApiError, ApiResponse, CursorPage } from '@/contracts';

export class ClientApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]>;

  constructor({ code, message, status, retryable, fieldErrors }: { code: string; message: string; status: number; retryable?: boolean; fieldErrors?: Record<string, string[]> }) {
    super(message);
    this.name = 'ClientApiError';
    this.code = code;
    this.status = status;
    this.retryable = retryable ?? false;
    this.fieldErrors = fieldErrors ?? {};
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

export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, { ...init, credentials: 'include', headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers } });
  } catch {
    throw new ClientApiError({ code: 'NETWORK_ERROR', message: 'We could not reach LUX Blinds. Try again.', status: 0, retryable: true });
  }
  const payload = await readPayload(response);
  if (!response.ok) {
    const envelope = isRecord(payload) && isRecord(payload.error) ? payload as unknown as ApiError : null;
    throw new ClientApiError({ code: envelope?.error.code ?? 'REQUEST_FAILED', message: envelope?.error.message ?? 'We could not complete that request. Try again.', status: response.status, retryable: envelope?.error.retryable, fieldErrors: envelope?.error.fieldErrors });
  }
  // Cursor pages already expose `data` at the top level alongside `page`;
  // preserve that shape instead of unwrapping the row array as an envelope.
  if (isRecord(payload) && 'page' in payload) return payload as T;
  if (isRecord(payload) && 'data' in payload) return (payload as ApiResponse<T>).data;
  return payload as T;
}

export function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  const encoded = query.toString();
  return encoded ? `?${encoded}` : '';
}

export function apiErrorMessage(error: unknown) {
  return error instanceof ClientApiError ? error.message : 'We could not complete that request. Try again.';
}

export type ClientPage<T> = CursorPage<T>;
